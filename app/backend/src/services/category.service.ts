import { Category } from '@/models/Category';
import { ApiError } from '@/utils/ApiError';
import { cache } from '@/redis/cache';
import { CACHE } from '@/constants';
import { slugify } from '@/utils/slug';

export const categoryService = {
  /** All active categories, cached (they change rarely). */
  async listActive() {
    return cache.remember(CACHE.KEY.categories(), CACHE.TTL.CATEGORIES, () =>
      Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    );
  },

  async listAll() {
    return Category.find().sort({ name: 1 }).populate('parent', 'name slug').lean();
  },

  async create(data: { name: string; description?: string; parent?: string | null; image?: string }) {
    const slug = slugify(data.name);
    if (await Category.exists({ slug })) throw ApiError.conflict('Category already exists');
    const category = await Category.create({ ...data, slug });
    await cache.del(CACHE.KEY.categories());
    return category.toObject();
  },

  async update(id: string, data: Record<string, unknown>) {
    if (data.name) data.slug = slugify(String(data.name));
    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw ApiError.notFound('Category not found');
    await cache.del(CACHE.KEY.categories());
    return category.toObject();
  },

  async remove(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw ApiError.notFound('Category not found');
    await cache.del(CACHE.KEY.categories());
    return { deleted: true };
  },
};
