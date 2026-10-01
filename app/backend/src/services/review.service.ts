import { Types } from 'mongoose';
import { Review } from '@/models/Review';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { ApiError } from '@/utils/ApiError';
import { getIO } from '@/sockets/io';
import { logger } from '@/utils/logger';

export interface CreateReviewInput {
  rating: number;
  title: string;
  comment: string;
}

export const reviewService = {
  /**
   * Resolves a Product by ObjectId or Slug.
   */
  async resolveProduct(idOrSlug: string) {
    const isObjectId = Types.ObjectId.isValid(idOrSlug) && idOrSlug.length === 24;
    const product = await Product.findOne(
      isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug },
    );
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  /**
   * List all reviews for a product with breakdown and summary statistics.
   */
  async listByProduct(idOrSlug: string) {
    const product = await this.resolveProduct(idOrSlug);
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).lean();

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    for (const r of reviews) {
      const rounded = Math.max(1, Math.min(5, Math.round(r.rating)));
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
      sum += r.rating;
    }

    const total = reviews.length;
    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return {
      reviews,
      summary: {
        average,
        total,
        breakdown,
      },
    };
  },

  /**
   * Create a new product review, update product ratings, and broadcast via Socket.IO in real time.
   */
  async create(idOrSlug: string, userId: string, input: CreateReviewInput) {
    const product = await this.resolveProduct(idOrSlug);
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound('User not found');

    const review = await Review.create({
      product: product._id,
      user: user._id,
      userName: user.name || 'Anonymous Customer',
      userEmail: user.email,
      rating: Math.max(1, Math.min(5, input.rating)),
      title: input.title.trim(),
      comment: input.comment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
    });

    // Recompute product ratings
    const allReviews = await Review.find({ product: product._id }).select('rating').lean();
    const totalCount = allReviews.length;
    const totalScore = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const ratingAverage = Number((totalScore / totalCount).toFixed(1));

    product.ratingAverage = ratingAverage;
    product.ratingCount = totalCount;
    await product.save();

    const reviewObj = review.toObject();

    // Broadcast in real-time to all connected storefront clients & admin panels
    try {
      getIO().emit('product:review:new', {
        productId: product._id.toString(),
        slug: product.slug,
        review: reviewObj,
        ratingAverage,
        ratingCount: totalCount,
      });
      logger.info('Broadcasted real-time review', { productId: product._id.toString() });
    } catch (err) {
      logger.warn('Socket broadcast failed for review', { error: (err as Error).message });
    }

    return reviewObj;
  },

  /**
   * Mark a review as helpful.
   */
  async markHelpful(reviewId: string) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true },
    );
    if (!review) throw ApiError.notFound('Review not found');
    return review.toObject();
  },
};
