import { FilterQuery, Types } from 'mongoose';
import { Product, type IProduct } from '@/models/Product';
import { ApiError } from '@/utils/ApiError';
import { cache } from '@/redis/cache';
import { CACHE, LOW_STOCK_THRESHOLD } from '@/constants';
import { getPageParams, buildPageMeta } from '@/utils/pagination';
import { slugify } from '@/utils/slug';
import { notificationService } from '@/services/notification.service';

type ListQuery = Record<string, unknown>;

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  popular: { ratingAverage: -1, ratingCount: -1 },
};

function buildFilter(q: ListQuery): FilterQuery<IProduct> {
  const filter: FilterQuery<IProduct> = {};
  if (!q.includeInactive) filter.isActive = true;
  if (q.featured !== undefined) filter.isFeatured = q.featured as boolean;
  if (q.category) filter.category = new Types.ObjectId(String(q.category));
  if (q.tag) filter.tags = String(q.tag);
  if (q.search) filter.$text = { $search: String(q.search) };
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    filter.price = {};
    if (q.minPrice !== undefined) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice !== undefined) filter.price.$lte = Number(q.maxPrice);
  }
  return filter;
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await Product.exists({ slug })) slug = `${base}-${n++}`;
  return slug;
}

async function uniqueSku(provided?: string): Promise<string> {
  if (provided) {
    const exists = await Product.exists({ sku: provided.toUpperCase() });
    if (exists) throw ApiError.conflict('A product with this SKU already exists');
    return provided.toUpperCase();
  }
  let sku: string;
  do {
    sku = `DC-${Math.floor(1000 + Math.random() * 8999)}`;
  } while (await Product.exists({ sku }));
  return sku;
}

export const productService = {
  /** Public/admin listing with search, filter, sort, pagination. List responses are cached. */
  async list(q: ListQuery) {
    const { page, limit, skip } = getPageParams(q);
    const filter = buildFilter(q);
    const sort = SORT_MAP[String(q.sort ?? 'newest')] ?? SORT_MAP.newest;

    // Only cache anonymous public lists; skip cache when inactive items are included (admin).
    const cacheable = !q.includeInactive;
    const cacheKey = CACHE.KEY.productList(
      Buffer.from(JSON.stringify({ ...q, page, limit })).toString('base64'),
    );

    const run = async () => {
      const [items, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug').lean(),
        Product.countDocuments(filter),
      ]);
      return { items, meta: buildPageMeta(total, page, limit) };
    };

    if (cacheable) return cache.remember(cacheKey, CACHE.TTL.PRODUCTS, run);
    return run();
  },

  async getByIdOrSlug(idOrSlug: string) {
    return cache.remember(CACHE.KEY.product(idOrSlug), CACHE.TTL.PRODUCT, async () => {
      const query = Types.ObjectId.isValid(idOrSlug)
        ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
        : { slug: idOrSlug };
      let product = await Product.findOne(query).populate('category', 'name slug').lean();

      // Intelligent fallback: if not matched directly, try matching base slug (e.g. wax-sachet vs wax-sachet-1)
      if (!product && typeof idOrSlug === 'string' && idOrSlug.trim()) {
        const cleanSlug = idOrSlug.trim().toLowerCase().replace(/-\d+$/, '');
        product = await Product.findOne({
          $or: [
            { slug: new RegExp(`^${cleanSlug}`, 'i') },
            { name: new RegExp(`^${cleanSlug.replace(/-/g, ' ')}`, 'i') },
          ],
        })
          .populate('category', 'name slug')
          .lean();
      }

      if (!product) throw ApiError.notFound('Product not found');
      return product;
    });
  },

  async related(idOrSlug: string, limit = 4) {
    const product = await Product.findOne(
      Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug },
    ).lean();
    if (!product) return [];
    return Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [{ category: product.category }, { type: product.type }],
    })
      .limit(limit)
      .lean();
  },

  async create(data: Record<string, unknown>, actorId: string) {
    const slug = await uniqueSlug(String(data.name));
    const sku = await uniqueSku(data.sku as string | undefined);
    const product = await Product.create({ ...data, slug, sku });
    await this.invalidate();

    await notificationService.create({
      type: 'product_created',
      title: 'Product created',
      message: `${product.name} was added to the catalogue`,
      forStaff: true,
      relatedEntity: { kind: 'product', id: product._id.toString() },
      dashboardDirty: true,
    });
    void actorId;
    return product.toObject();
  },

  async update(id: string, data: Record<string, unknown>) {
    if (data.name && !data.slug) data.slug = await uniqueSlug(String(data.name));
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) throw ApiError.notFound('Product not found');
    await this.invalidate(id, product.slug);

    // Warn staff if an inventory edit dropped stock to a low level.
    if (typeof data.stock === 'number' && data.stock <= LOW_STOCK_THRESHOLD) {
      await notificationService.create({
        type: 'low_stock',
        title: 'Low stock',
        message: `${product.name} is low on stock (${product.stock} left)`,
        forStaff: true,
        relatedEntity: { kind: 'product', id: product._id.toString() },
        dashboardDirty: true,
      });
    }
    return product.toObject();
  },

  async remove(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw ApiError.notFound('Product not found');
    await this.invalidate(id, product.slug);
    return { deleted: true };
  },

  /** Busts product caches after a write. */
  async invalidate(id?: string, slug?: string) {
    await cache.delByPattern(CACHE.PATTERN.productLists);
    if (id) await cache.del(CACHE.KEY.product(id));
    if (slug) await cache.del(CACHE.KEY.product(slug));
    if (!id && !slug) await cache.delByPattern(CACHE.PATTERN.products);
  },
};
