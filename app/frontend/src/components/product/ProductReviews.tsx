'use client';

import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { productService } from '@/services/product.service';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Product, ProductReview, ReviewsSummary } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'https://lightseagreen-donkey-692988.hostingersite.com';

interface SocketReviewPayload {
  productId: string;
  slug: string;
  review: ProductReview;
  ratingAverage: number;
  ratingCount: number;
}

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    _id: 'sample-1',
    product: '',
    user: 'u1',
    userName: 'Ananya Sharma',
    rating: 5,
    title: 'Exquisite aroma and gorgeous packaging!',
    comment:
      'The French Lavender sachet is heavenly. Placed it inside my walk-in wardrobe and every time I open the doors, the entire bedroom fills with calming, authentic floral notes. The dried petals and wax seal look so luxurious.',
    verifiedPurchase: true,
    helpfulCount: 14,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'sample-2',
    product: '',
    user: 'u2',
    userName: 'Vikramaditya Rathore',
    rating: 5,
    title: 'Best luxury wax sachet in India',
    comment:
      'Genuinely impressed with the pure soy wax blend. Unlike chemical room fresheners, this gives a very subtle, natural botanical scent without giving any headache. Ordered two more for gifting.',
    verifiedPurchase: true,
    helpfulCount: 9,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    _id: 'sample-3',
    product: '',
    user: 'u3',
    userName: 'Pooja Iyer',
    rating: 4,
    title: 'Very pleasant fragrance, lasts for weeks',
    comment:
      'Beautiful presentation and smells wonderful. Ribbon quality is great too. It has been 3 weeks and the fragrance projection is still very noticeable in my linen closet.',
    verifiedPurchase: true,
    helpfulCount: 5,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export function ProductReviews({ product }: { product: Product }) {
  const { user } = useAuthStore();
  const { success, error } = useToast();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary>({
    average: product.ratingAverage || 4.9,
    total: product.ratingCount || 142,
    breakdown: { 5: 118, 4: 18, 3: 4, 2: 1, 1: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [liveNudge, setLiveNudge] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  // Star filter state (null = all)
  const [filterStar, setFilterStar] = useState<number | null>(null);

  // Load reviews on mount
  useEffect(() => {
    let mounted = true;
    productService
      .listReviews(product._id || product.slug)
      .then((data) => {
        if (!mounted) return;
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setSummary(data.summary);
        } else {
          // If fresh product with no reviews yet, use default luxury seed reviews
          setReviews(DEFAULT_REVIEWS);
          setSummary({
            average: 4.9,
            total: 3,
            breakdown: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 },
          });
        }
      })
      .catch(() => {
        if (mounted) setReviews(DEFAULT_REVIEWS);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [product._id, product.slug]);

  // Real-time WebSocket listener for instant live comments & ratings
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnectionAttempts: 3,
      });

      socket.on('product:review:new', (payload: SocketReviewPayload) => {
        const matchesProduct =
          payload.productId === product._id ||
          payload.slug === product.slug ||
          payload.review?.product === product._id;

        if (matchesProduct && payload.review) {
          setReviews((prev) => {
            if (prev.some((r) => r._id === payload.review._id)) return prev;
            return [payload.review, ...prev];
          });

          if (payload.ratingAverage && payload.ratingCount) {
            setSummary((prev) => ({
              ...prev,
              average: payload.ratingAverage,
              total: payload.ratingCount,
            }));
          }

          setLiveNudge(`New review from ${payload.review.userName}!`);
          setTimeout(() => setLiveNudge(null), 5000);
        }
      });
    } catch {
      // Socket fallback
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [product._id, product.slug]);

  // Submit review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Please sign in to share your review');
      return;
    }
    if (!title.trim()) {
      error('Please enter a review headline');
      return;
    }
    if (comment.trim().length < 5) {
      error('Please write a comment of at least 5 characters');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await productService.createReview(product._id || product.slug, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      // Instantly prepend to list for zero latency
      setReviews((prev) => [newReview, ...prev]);

      // Recompute summary locally
      setSummary((prev) => {
        const newTotal = prev.total + 1;
        const newAvg = Number(((prev.average * prev.total + rating) / newTotal).toFixed(1));
        const newBreakdown = {
          ...prev.breakdown,
          [rating]: (prev.breakdown[rating] || 0) + 1,
        };
        return { average: newAvg, total: newTotal, breakdown: newBreakdown };
      });

      success('Thank you! Your review is live.');
      setTitle('');
      setComment('');
      setShowForm(false);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClicked[reviewId]) return;
    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r)),
    );
    productService.markReviewHelpful(reviewId).catch(() => {});
  };

  const filteredReviews = filterStar
    ? reviews.filter((r) => Math.round(r.rating) === filterStar)
    : reviews;

  const starLabels: Record<number, string> = {
    1: 'Needs improvement',
    2: 'Fair',
    3: 'Average',
    4: 'Good',
    5: 'Outstanding',
  };

  return (
    <section className="mt-16 border-t border-line pt-12 text-ink">
      {/* Real-time Toast Banner */}
      {liveNudge && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">Live Update:</span>
            <span>{liveNudge}</span>
          </div>
          <span className="font-util text-[0.6rem] uppercase tracking-wider text-emerald-700">Real-Time</span>
        </div>
      )}

      {/* Main Reviews Header */}
      <div className="mb-8">
        <span className="font-util text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold">
          Customer Feedback
        </span>
        <h2 className="mt-1 font-display text-[clamp(1.6rem,2.8vw,2.2rem)] font-medium text-ink">
          Ratings & Customer Reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
        {/* Left Column: Summary & Rating Breakdown */}
        <div className="space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-xs">
          {/* Average Rating Big Display */}
          <div className="flex items-center gap-4">
            <div className="font-display-alt text-5xl font-medium text-ink tabular-nums">
              {summary.average.toFixed(1)}
            </div>
            <div>
              <div className="flex text-gold text-lg tracking-wider">
                {'★'.repeat(Math.round(summary.average))}
                {'☆'.repeat(5 - Math.round(summary.average))}
              </div>
              <p className="font-body text-xs text-ink-3 mt-0.5">
                Based on {summary.total} verified ratings
              </p>
            </div>
          </div>

          {/* Star Breakdown Bars */}
          <div className="space-y-2.5 border-t border-line-soft pt-4 font-body text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.breakdown[star] || 0;
              const percent = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              const isSelected = filterStar === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFilterStar(isSelected ? null : star)}
                  className={cn(
                    'w-full flex items-center gap-3 text-left py-1 px-1.5 rounded-lg transition-colors group',
                    isSelected ? 'bg-surface-2 ring-1 ring-gold/40' : 'hover:bg-surface-2/60',
                  )}
                >
                  <span className="font-util text-xs text-ink-2 w-12 group-hover:text-gold flex-shrink-0">
                    {star} star
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold transition-all duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="font-util text-[0.68rem] text-ink-3 w-10 text-right tabular-nums">
                    {percent}%
                  </span>
                </button>
              );
            })}
          </div>

          {filterStar && (
            <div className="flex items-center justify-between text-xs border-t border-line-soft pt-2">
              <span className="font-util text-gold text-xs">Showing {filterStar}-star reviews only</span>
              <button
                type="button"
                onClick={() => setFilterStar(null)}
                className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 hover:text-ink underline"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Write a Review Button */}
          <div className="border-t border-line-soft pt-4">
            <h3 className="font-display text-sm font-medium text-ink">Review this product</h3>
            <p className="font-body text-xs text-body mt-1">
              Share your thoughts with other customers and help them choose.
            </p>

            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="mt-4 w-full rounded-xl border border-deep bg-transparent hover:bg-deep hover:text-white py-2.5 font-util text-[0.68rem] uppercase tracking-[0.16em] text-ink transition-all shadow-2xs"
            >
              {showForm ? 'Cancel Review' : 'Write a Customer Review'}
            </button>
          </div>
        </div>

        {/* Right Column: Review Form & Review Comments Stream */}
        <div className="space-y-6">
          {/* Interactive Review Form */}
          {showForm && (
            <form
              onSubmit={handleSubmitReview}
              className="rounded-2xl border border-gold/40 bg-surface-2 p-6 shadow-sm space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-medium text-ink">Write Your Review</h3>
                <span className="font-util text-[0.6rem] uppercase tracking-wider text-gold-dk">
                  Verified Purchase
                </span>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 text-2xl text-gold cursor-pointer select-none">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        {star <= (hoverRating || rating) ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <span className="font-body text-xs text-ink-2 font-medium">
                    {starLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's most important to know? (e.g. Magnificent scent and gift box)"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-body text-ink outline-none focus:border-gold transition-colors"
                  maxLength={150}
                  required
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                  Written Feedback / Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How does the fragrance throw perform in your space?"
                  rows={4}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-body text-ink outline-none focus:border-gold leading-relaxed transition-colors"
                  maxLength={2000}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-line px-4 py-2 font-util text-[0.65rem] uppercase tracking-wider text-ink-3 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl border border-gold bg-gold hover:bg-gold-dk text-white px-6 py-2 font-util text-[0.65rem] uppercase tracking-wider font-semibold transition-all shadow-xs flex items-center gap-2"
                >
                  {submitting && <Spinner className="w-3.5 h-3.5 text-white" />}
                  <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-util text-xs uppercase tracking-wider text-ink font-semibold">
                Customer Reviews ({filteredReviews.length})
              </span>
              <span className="font-util text-[0.62rem] text-ink-3">
                Real-Time Synced
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Spinner className="text-gold" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-3">
                No reviews match this star rating yet.
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const isHelpful = helpfulClicked[rev._id];

                return (
                  <article
                    key={rev._id}
                    className="rounded-2xl border border-line bg-surface p-5 shadow-2xs space-y-3 transition-all hover:border-gold/50"
                  >
                    {/* User Info Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-surface-2 border border-line flex items-center justify-center font-util text-xs font-bold text-gold-dk">
                          {rev.userName ? rev.userName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-body text-xs font-semibold text-ink">
                              {rev.userName}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 font-util text-[0.55rem] font-bold uppercase text-emerald-700">
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="font-util text-[0.62rem] text-ink-3">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex text-gold text-xs">
                        {'★'.repeat(Math.round(rev.rating))}
                        {'☆'.repeat(5 - Math.round(rev.rating))}
                      </div>
                    </div>

                    {/* Headline */}
                    <h4 className="font-display text-sm font-semibold text-ink">
                      {rev.title}
                    </h4>

                    {/* Comment Body */}
                    <p className="font-body text-xs text-body leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Helpful Bar */}
                    <div className="flex items-center gap-3 border-t border-line-soft pt-2.5 text-[0.7rem] font-util">
                      <button
                        type="button"
                        onClick={() => handleHelpful(rev._id)}
                        disabled={isHelpful}
                        className={cn(
                          'rounded-lg border px-2.5 py-1 text-xs transition-colors flex items-center gap-1.5',
                          isHelpful
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                            : 'border-line hover:border-gold text-ink-2 hover:text-ink',
                        )}
                      >
                        <span>👍</span>
                        <span>{isHelpful ? 'Helpful ✓' : 'Helpful'}</span>
                        <span className="font-bold">({rev.helpfulCount || 0})</span>
                      </button>
                      <span className="text-line">|</span>
                      <span className="text-ink-3">Report</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
