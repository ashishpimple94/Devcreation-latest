import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { User } from '@/models/User';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { ROLES } from '@/constants';
import { slugify } from '@/utils/slug';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/seed/products.data';

/**
 * Idempotent seed: upserts the super-admin, categories and products from the
 * original site. Safe to run repeatedly. Does not run in production unless
 * explicitly allowed.
 */
async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB for seeding');

  // Super admin
  const existingAdmin = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      role: ROLES.SUPER_ADMIN,
    });
    logger.info(`Created super admin: ${env.SEED_ADMIN_EMAIL}`);
  } else {
    logger.info('Super admin already exists — skipping');
  }

  // Categories
  const categoryIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of SEED_CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { name: cat.name, description: cat.description, isActive: true } },
      { upsert: true, new: true },
    );
    categoryIdBySlug.set(cat.slug, doc._id);
  }
  logger.info(`Seeded ${SEED_CATEGORIES.length} categories`);

  // Products
  for (const p of SEED_PRODUCTS) {
    await Product.findOneAndUpdate(
      { sku: p.sku },
      {
        $set: {
          name: p.name,
          slug: slugify(p.name),
          type: p.type,
          fragrance: p.fragrance,
          description: p.description,
          price: p.price,
          weight: p.weight,
          stock: p.stock,
          images: p.images.map((url, i) => ({ url, alt: p.name, isPrimary: i === 0 })),
          tags: p.tags,
          isActive: true,
          isFeatured: p.isFeatured,
          category: categoryIdBySlug.get(p.categorySlug) ?? null,
        },
      },
      { upsert: true, new: true },
    );
  }
  logger.info(`Seeded ${SEED_PRODUCTS.length} products`);

  await mongoose.disconnect();
  logger.info('Seeding complete ✅');
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seeding failed', { err: (err as Error).message });
  process.exit(1);
});
