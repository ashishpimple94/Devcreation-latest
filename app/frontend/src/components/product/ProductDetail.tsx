'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupee, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { ProductCard } from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import type { Product } from '@/types';

/**
 * Product Detail Experience:
 * Combines Amazon's high-converting 3-column layout, image zoom loupe, offers box, and buy box
 * with Dev Creation's authentic luxury brand aesthetic:
 * - Fonts: Cormorant Garamond (`font-display-alt`), Playfair (`font-display`), DM Sans (`font-body`), JetBrains Mono (`font-util`)
 * - Theme: Paper cream (`bg-bg`), Warm Espresso (`text-ink`), Signature Gold (`text-gold`, `bg-gold`, `border-gold`)
 */
export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const images = product.images.length ? product.images : [{ url: '/assets/Logos/logo.jpeg', alt: product.name }];
  const [activeImg, setActiveImg] = useState(0);
  const [variantSku, setVariantSku] = useState<string | undefined>(product.variants[0]?.sku);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishing, setWishing] = useState(false);
  const [giftOption, setGiftOption] = useState(true);

  // Smooth Image Zoom Magnifier
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const add = useCartStore((s) => s.add);
  const closeCart = useCartStore((s) => s.close);
  const user = useAuthStore((s) => s.user);
  const { success, error } = useToast();
  const router = useRouter();

  const activeVariant = product.variants.find((v) => v.sku === variantSku);
  const price = activeVariant?.price ?? product.price;
  const stock = activeVariant?.stock ?? product.stock;

  const comparePrice = product.compareAtPrice && product.compareAtPrice > price
    ? product.compareAtPrice
    : product.discountPercent && product.discountPercent > 0
      ? Math.round(price / (1 - product.discountPercent / 100))
      : null;

  const discountPercent = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : product.discountPercent || 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((z) => ({ ...z, show: false }));
  };

  const handleAdd = async () => {
    if (!user) {
      error('Please log in to add items to your cart');
      return;
    }
    setAdding(true);
    try {
      await add(product._id, qty, variantSku);
      success('Added to cart');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      error('Please log in to buy this item');
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    setBuying(true);
    try {
      await add(product._id, qty, variantSku);
      closeCart();
      router.push('/checkout');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not proceed to checkout');
    } finally {
      setBuying(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      error('Please log in to save to your wishlist');
      return;
    }
    setWishing(true);
    try {
      const res = await api.post<{ inWishlist: boolean }>(`/users/me/wishlist/${product._id}`);
      success(res.data.inWishlist ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not update wishlist');
    } finally {
      setWishing(false);
    }
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="bg-bg min-h-screen text-ink antialiased">
      {/* Luxury Breadcrumb Bar */}
      <div className="border-b border-line bg-surface/70 backdrop-blur-xs px-[var(--pad)] py-3">
        <div className="mx-auto max-w-shell flex items-center gap-2 font-util text-[0.62rem] uppercase tracking-[0.16em] text-ink-3 flex-wrap">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>·</span>
          <Link href="/products" className="hover:text-gold transition-colors">Collection</Link>
          <span>·</span>
          <Link href="/products" className="hover:text-gold transition-colors">{product.type || 'Wax Sachets'}</Link>
          <span>·</span>
          <span className="truncate max-w-[280px] text-ink font-medium">{product.name}</span>
        </div>
      </div>

      <main className="mx-auto max-w-shell px-[var(--pad)] py-8 sm:py-12">
        {/* Amazon 3-Column Layout in Dev Creation Luxury Styling */}
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr_320px] xl:grid-cols-[480px_1fr_340px] gap-8 xl:gap-10 items-start">

          {/* COLUMN 1: Gallery with Thumbnails & Zoom Lens */}
          <div className="flex flex-col-reverse sm:flex-row gap-3.5 lg:sticky lg:top-24">
            {/* Vertical Thumbnail Strip */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  onMouseEnter={() => setActiveImg(i)}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'h-16 w-16 overflow-hidden rounded-xl border-2 p-0.5 transition-all bg-surface-2',
                    i === activeImg
                      ? 'border-gold ring-2 ring-gold/20 shadow-xs'
                      : 'border-line hover:border-gold/60 opacity-80 hover:opacity-100',
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover rounded-lg" />
                </button>
              ))}
            </div>

            {/* Main Medium Image Frame with Zoom Lens */}
            <div className="flex-1">
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative h-[380px] sm:h-[430px] w-full cursor-crosshair overflow-hidden rounded-2xl border border-line bg-surface-2 flex items-center justify-center p-3 select-none shadow-xs group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeImg].url}
                  alt={images[activeImg].alt ?? product.name}
                  className="h-full w-full object-cover rounded-xl pointer-events-none transition-transform duration-300"
                  style={
                    zoomPos.show
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: 'scale(1.9)',
                          transition: 'none',
                        }
                      : { transform: 'scale(1)', transition: 'transform 0.25s ease-out' }
                  }
                />

                {/* Offer Badge Overlay */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <span className="rounded-full border border-flame/40 bg-flame/95 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                      🔥 Limited Deal
                    </span>
                    <span className="rounded-full bg-deep/90 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-gold-lt shadow-sm backdrop-blur-xs">
                      Save {discountPercent}%
                    </span>
                  </div>
                )}

                {/* Pack / Weight Badge */}
                {product.weight && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="rounded-full border border-gold/30 bg-white/95 px-2.5 py-0.5 font-util text-[0.58rem] font-semibold uppercase tracking-wider text-gold-dk shadow-xs backdrop-blur-md">
                      🎁 {product.weight}
                    </span>
                  </div>
                )}

                {/* Hover prompt */}
                <div
                  className={cn(
                    'absolute bottom-3 right-3 font-util text-[0.55rem] uppercase tracking-wider text-ink-3 bg-white/90 px-2 py-0.5 rounded-full border border-line transition-opacity pointer-events-none shadow-2xs',
                    zoomPos.show ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  🔍 Hover to Zoom
                </div>
              </div>

              {/* Wishlist Link & Brand Origin */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className="font-util text-[0.62rem] uppercase tracking-wider text-ink-2 hover:text-gold transition-colors flex items-center gap-1"
                >
                  <span>♡</span> {wishing ? 'Saving...' : 'Add to Wishlist'}
                </button>
                <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3">
                  100% Hand-Poured in India
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Center Details & Offers */}
          <div className="space-y-4">
            {/* Brand Store Link */}
            <div>
              <Link href="/products" className="font-util text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-dk transition-colors">
                Dev Creation Fragrance House
              </Link>
              <h1 className="mt-1 font-display-alt text-[clamp(1.85rem,3.2vw,2.5rem)] font-medium leading-tight text-ink">
                {product.name}
              </h1>
            </div>

            {/* Ratings & Dev's Choice Badge */}
            <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3.5">
              <div className="flex items-center gap-1 text-gold text-sm">
                <span>★★★★★</span>
                <span className="font-body text-xs font-semibold text-ink">4.9</span>
              </div>
              <span className="text-line">|</span>
              <span className="font-body text-xs text-ink-3">142 customer reviews</span>
              <span className="text-line">|</span>
              <div className="w-full sm:w-auto">
                <span className="inline-flex items-center rounded-full bg-deep px-2.5 py-0.5 font-util text-[0.58rem] font-bold text-white shadow-xs">
                  <span>Dev’s</span>&nbsp;<span className="text-gold-lt">Choice</span>
                </span>
                <span className="ml-1.5 font-body text-xs text-ink-3">in {product.type || 'Wax Sachets'}</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-1.5 border-b border-line pb-4">
              {discountPercent > 0 && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-flame/15 px-2.5 py-0.5 font-util text-[0.6rem] font-bold text-flame uppercase tracking-wider">
                    Deal Active
                  </span>
                  <span className="font-body text-sm font-bold text-flame">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-2.5">
                <span className="font-body text-3xl font-bold tabular-nums text-ink">
                  {formatRupee(price)}
                </span>
                {comparePrice && comparePrice > price && (
                  <span className="font-body text-base text-ink-3 line-through">
                    {formatRupee(comparePrice)}
                  </span>
                )}
              </div>

              <p className="font-body text-xs text-ink-3">Inclusive of all taxes</p>
              <p className="font-body text-xs text-ink-2">
                <strong>EMI options available</strong> · Free pan-India shipping on orders over ₹499
              </p>
            </div>

            {/* Fragrance specification callout */}
            {product.fragrance && (
              <div className="rounded-xl border border-line-soft bg-surface-2 px-3.5 py-2">
                <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3 block">
                  Signature Fragrance Notes
                </span>
                <span className="font-body text-sm font-semibold text-ink">
                  {product.fragrance}
                </span>
              </div>
            )}

            {/* Offers Box in Dev Creation Theme */}
            <div className="space-y-2.5 border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-dk">
                  🏷️ Available Offers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-line bg-surface p-3 shadow-2xs hover:border-gold transition-colors">
                  <span className="font-util text-[0.6rem] font-bold uppercase tracking-wider text-ink block mb-1">
                    Bank Offer
                  </span>
                  <p className="font-body text-xs text-body leading-relaxed line-clamp-2">
                    10% instant discount on UPI and select cards.
                  </p>
                  <span className="mt-2 block font-util text-[0.58rem] text-gold uppercase tracking-wider font-semibold">
                    Code: DEV10
                  </span>
                </div>

                <div className="rounded-xl border border-line bg-surface p-3 shadow-2xs hover:border-gold transition-colors">
                  <span className="font-util text-[0.6rem] font-bold uppercase tracking-wider text-ink block mb-1">
                    Gift Offer
                  </span>
                  <p className="font-body text-xs text-body leading-relaxed line-clamp-2">
                    Complimentary aroma wax melt with orders above ₹799.
                  </p>
                  <span className="mt-2 block font-util text-[0.58rem] text-gold uppercase tracking-wider font-semibold">
                    Auto-applied
                  </span>
                </div>

                <div className="rounded-xl border border-line bg-surface p-3 shadow-2xs hover:border-gold transition-colors">
                  <span className="font-util text-[0.6rem] font-bold uppercase tracking-wider text-ink block mb-1">
                    Pack Savings
                  </span>
                  <p className="font-body text-xs text-body leading-relaxed line-clamp-2">
                    Buy 2 or more packs to unlock bulk gifting discount.
                  </p>
                  <span className="mt-2 block font-util text-[0.58rem] text-gold uppercase tracking-wider font-semibold">
                    Save extra
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Trust Icons in Brand Style */}
            <div className="grid grid-cols-4 gap-2 border-b border-line py-3.5 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🚚</span>
                <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-2">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🌿</span>
                <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-2">100% Pure Soy</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔒</span>
                <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-2">Secure Checkout</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🎁</span>
                <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-2">Gift Packaging</span>
              </div>
            </div>

            {/* Product Specifications Table */}
            <div className="space-y-2 border-b border-line pb-4">
              <h3 className="font-display text-sm font-medium text-ink">Product Specifications</h3>
              <table className="w-full text-xs font-body">
                <tbody>
                  <tr className="border-b border-line-soft">
                    <td className="py-1.5 font-medium text-ink-3 w-36">Brand</td>
                    <td className="py-1.5 text-ink font-semibold">Dev Creation</td>
                  </tr>
                  {product.fragrance && (
                    <tr className="border-b border-line-soft">
                      <td className="py-1.5 font-medium text-ink-3">Fragrance</td>
                      <td className="py-1.5 text-ink font-semibold">{product.fragrance}</td>
                    </tr>
                  )}
                  <tr className="border-b border-line-soft">
                    <td className="py-1.5 font-medium text-ink-3">Product Type</td>
                    <td className="py-1.5 text-ink">{product.type || 'Wax Sachet'}</td>
                  </tr>
                  {product.weight && (
                    <tr className="border-b border-line-soft">
                      <td className="py-1.5 font-medium text-ink-3">Pack / Weight</td>
                      <td className="py-1.5 text-ink">{product.weight}</td>
                    </tr>
                  )}
                  <tr className="border-b border-line-soft">
                    <td className="py-1.5 font-medium text-ink-3">Wax Formulation</td>
                    <td className="py-1.5 text-ink">100% Organic Soy Blend & Essential Oils</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium text-ink-3">Origin</td>
                    <td className="py-1.5 text-ink">Handmade in India</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* "About this item" Bullet Points */}
            <div className="space-y-2 pb-2">
              <h3 className="font-display text-sm font-medium text-ink">About This Creation</h3>
              <p className="font-body text-xs text-body leading-relaxed mb-3">
                {product.description}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 font-body text-xs text-body leading-relaxed">
                <li>
                  <strong className="text-ink">Long-Lasting Aroma:</strong> Infused with therapeutic-grade botanical fragrance oils providing an uplifting and calming ambiance in wardrobes, closets, drawers, and workspaces.
                </li>
                <li>
                  <strong className="text-ink">100% Organic Soy Wax:</strong> Handcrafted with eco-conscious, non-toxic soy wax that is biodegradable, clean burning, and completely safe for linen and clothing.
                </li>
                <li>
                  <strong className="text-ink">Artisan Decorated:</strong> Each sachet is hand-embellished with real dried flowers, botanical petals, and a luxury hanging ribbon.
                </li>
                <li>
                  <strong className="text-ink">Ready to Gift:</strong> Elegantly presented in luxury packaging, making it an ideal gift for weddings, housewarmings, festive celebrations, and corporate hampers.
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMN 3: The Dev Creation Buy Box */}
          <div className="rounded-2xl border border-line bg-surface p-5 text-xs shadow-card lg:sticky lg:top-24 space-y-4">
            {/* Price Header */}
            <div>
              <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3 block">Total Price</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-body text-2xl font-bold text-ink tabular-nums">
                  {formatRupee(price)}
                </span>
                {comparePrice && comparePrice > price && (
                  <span className="font-body text-xs text-ink-3 line-through ml-1.5">
                    {formatRupee(comparePrice)}
                  </span>
                )}
              </div>
              {comparePrice && comparePrice > price && (
                <span className="font-util text-[0.62rem] text-emerald-700 font-semibold block mt-0.5">
                  Save {formatRupee(comparePrice - price)} ({discountPercent}% OFF)
                </span>
              )}
            </div>

            {/* Delivery Info */}
            <div className="space-y-1 font-body text-xs border-t border-line-soft pt-3">
              <div className="text-ink">
                <strong className="text-emerald-700">FREE Delivery</strong> by <strong>{formattedDelivery}</strong>
              </div>
              <div className="text-ink-3 text-[0.72rem]">
                Order within <span className="text-emerald-700 font-semibold">12 hrs</span> for fastest dispatch
              </div>
              <div className="flex items-center gap-1 font-util text-[0.65rem] text-gold hover:text-gold-dk transition-colors cursor-pointer pt-0.5">
                <span>📍</span>
                <span>Deliver to your location</span>
              </div>
            </div>

            {/* In Stock */}
            <div>
              {stock > 0 ? (
                <span className="font-util text-xs uppercase tracking-wider font-bold text-emerald-700 block">
                  ✓ In Stock ({stock} units left)
                </span>
              ) : (
                <span className="font-util text-xs uppercase tracking-wider font-bold text-red-600 block">
                  ✕ Out of Stock
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {stock > 0 && (
              <div className="flex items-center justify-between border-t border-line-soft pt-2">
                <label htmlFor="buybox-quantity" className="font-util text-[0.65rem] uppercase tracking-wider text-ink font-semibold">
                  Quantity:
                </label>
                <select
                  id="buybox-quantity"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="rounded-lg border border-line bg-surface-2 px-3 py-1 font-body text-xs font-semibold text-ink outline-none focus:border-gold"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CTA Buttons in Luxury Dev Creation Palette */}
            <div className="space-y-2.5 pt-1">
              {/* Add to Cart: Deep Rich Button */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={stock <= 0 || adding || buying}
                className={cn(
                  'w-full rounded-xl py-3 px-4 font-util text-[0.68rem] uppercase tracking-[0.16em] transition-all duration-300 active:scale-[0.98]',
                  'bg-deep text-white border border-deep hover:bg-[#3D2A1E] shadow-sm',
                  stock <= 0 && 'opacity-50 cursor-not-allowed',
                )}
              >
                {adding ? 'Adding to Cart...' : 'Add to Cart'}
              </button>

              {/* Buy Now: Signature Gold Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock <= 0 || buying || adding}
                className={cn(
                  'w-full rounded-xl py-3 px-4 font-util text-[0.68rem] uppercase tracking-[0.16em] transition-all duration-300 active:scale-[0.98]',
                  'bg-gold text-white border border-gold hover:bg-gold-dk shadow-sm',
                  stock <= 0 && 'opacity-50 cursor-not-allowed',
                )}
              >
                {buying ? 'Proceeding to Checkout...' : 'Buy Now'}
              </button>
            </div>

            {/* Security & Provenance */}
            <div className="space-y-1 border-t border-line-soft pt-3 font-util text-[0.62rem] text-ink-3">
              <div className="flex items-center gap-1.5 text-gold-dk font-semibold">
                <span>🔒</span>
                <span>Secure & Encrypted Checkout</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-1 pt-1 font-body text-xs">
                <span className="text-ink-3">Ships from:</span>
                <span className="text-ink font-medium">Dev Creation</span>
                <span className="text-ink-3">Sold by:</span>
                <span className="text-ink font-medium">Dev Creation Studio</span>
              </div>
            </div>

            {/* Gift Wrap Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer border-t border-line-soft pt-2 font-body text-xs text-ink">
              <input
                type="checkbox"
                checked={giftOption}
                onChange={(e) => setGiftOption(e.target.checked)}
                className="rounded border-line text-gold focus:ring-gold"
              />
              <span>Add luxury gift wrap & personal note</span>
            </label>

            {/* Wishlist Button */}
            <div className="border-t border-line-soft pt-2">
              <button
                type="button"
                onClick={toggleWishlist}
                disabled={wishing}
                className="w-full rounded-xl border border-line bg-surface-2 py-2 font-util text-[0.65rem] uppercase tracking-[0.14em] text-ink-2 hover:border-gold hover:text-ink transition-colors"
              >
                {wishing ? 'Updating...' : '♡ Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* "You May Also Like" Related Products */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-line pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-util text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold">
                  Curated Collection
                </span>
                <h2 className="mt-1 font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium text-ink">
                  You May Also Like
                </h2>
              </div>
              <Link href="/products" className="font-util text-xs text-gold hover:text-gold-dk uppercase tracking-wider">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
