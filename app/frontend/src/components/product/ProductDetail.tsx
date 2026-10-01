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
 * Amazon-Exact Product Detail Experience.
 * Features:
 * - 3-Column Amazon layout: Gallery with Hover Zoom Magnifier | Details & Offers | Iconic Buy Box
 * - Star ratings, "Dev's Choice" badge, "Limited time deal" banner
 * - Offers carousel (Bank, Partner, Pack discounts)
 * - 4-point Trust Icon bar (Free Delivery, Soy Wax, Secure, Gift Packaging)
 * - Amazon-style Specs Table & "About this item" bullet list
 * - Amazon signature yellow "Add to Cart" & orange "Buy Now" CTA buttons
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

  // Amazon-style Image Zoom Magnifier state
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
      success(res.data.inWishlist ? 'Added to your Wish List' : 'Removed from your Wish List');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not update wishlist');
    } finally {
      setWishing(false);
    }
  };

  // Delivery date calculations (2-3 days ahead like Amazon Prime)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#0F1111] antialiased">
      {/* Amazon Breadcrumb Bar */}
      <div className="border-b border-[#E7E7E7] bg-white px-4 py-2.5 text-xs text-[#565959]">
        <div className="mx-auto max-w-[1440px] flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#C7511F] hover:underline">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-[#C7511F] hover:underline">Home Fragrances</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-[#C7511F] hover:underline">{product.type || 'Wax Sachets'}</Link>
          <span>›</span>
          <span className="truncate max-w-[280px] font-medium text-[#0F1111]">{product.name}</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
        {/* Amazon 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr_310px] xl:grid-cols-[500px_1fr_330px] gap-6 xl:gap-8 items-start">

          {/* COLUMN 1: Gallery with Thumbnails & Zoom Lens */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 lg:sticky lg:top-20">
            {/* Vertical Thumbnail Strip */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  onMouseEnter={() => setActiveImg(i)}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-md border p-0.5 transition-all bg-white',
                    i === activeImg
                      ? 'border-[#E77600] ring-2 ring-[#E77600]/30 shadow-xs'
                      : 'border-[#D5D9D9] hover:border-[#888C8C] opacity-80 hover:opacity-100',
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>

            {/* Main Image Frame with Amazon Zoom Lens */}
            <div className="flex-1">
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative h-[380px] sm:h-[440px] w-full cursor-crosshair overflow-hidden rounded-lg border border-[#D5D9D9] bg-white flex items-center justify-center p-3 select-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeImg].url}
                  alt={images[activeImg].alt ?? product.name}
                  className="h-full w-full object-contain pointer-events-none"
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

                {/* Amazon Deal Badge Overlay */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="rounded bg-[#CC0C39] px-2.5 py-1 text-xs font-bold text-white shadow-xs uppercase tracking-wider">
                      Limited time deal
                    </span>
                  </div>
                )}

                {/* Pack / Weight Badge */}
                {product.weight && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="rounded border border-[#D5D9D9] bg-white/95 px-2 py-0.5 text-[0.7rem] font-semibold text-[#0F1111] shadow-xs">
                      🎁 {product.weight}
                    </span>
                  </div>
                )}

                {/* Hover prompt */}
                <div
                  className={cn(
                    'absolute bottom-2 right-2 text-[0.68rem] text-[#565959] bg-white/80 px-2 py-0.5 rounded transition-opacity pointer-events-none',
                    zoomPos.show ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  🔍 Hover to zoom
                </div>
              </div>

              {/* Share & Wishlist under image */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-[#007185]">
                <button onClick={toggleWishlist} className="hover:text-[#C7511F] hover:underline flex items-center gap-1">
                  <span>♡</span> {wishing ? 'Updating...' : 'Add to Wish List'}
                </button>
                <span className="text-[#565959]">Handcrafted in India</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Center Details & Offers */}
          <div className="space-y-4">
            {/* Brand Store Link */}
            <div>
              <Link href="/products" className="text-xs font-medium text-[#007185] hover:text-[#C7511F] hover:underline">
                Visit the Dev Creation Store
              </Link>
              <h1 className="mt-1 text-xl sm:text-2xl font-normal leading-snug text-[#0F1111]">
                {product.name} — Handcrafted Botanical Aromatherapy Sachet
              </h1>
            </div>

            {/* Ratings & Amazon's Choice Badge */}
            <div className="flex flex-wrap items-center gap-3 border-b border-[#E7E7E7] pb-3 text-xs">
              <div className="flex items-center gap-1 text-[#FFA41C]">
                <span>★★★★★</span>
                <span className="text-[#007185] font-semibold hover:underline cursor-pointer">4.8</span>
              </div>
              <span className="text-[#565959]">|</span>
              <span className="text-[#007185] hover:underline cursor-pointer">142 ratings</span>
              <span className="text-[#565959]">|</span>
              <span className="text-[#565959]">50+ bought in past month</span>
              <div className="w-full sm:w-auto">
                <span className="inline-flex items-center rounded-xs bg-[#232F3E] text-white px-2 py-0.5 text-[0.68rem] font-bold">
                  <span>Dev’s</span>&nbsp;<span className="text-[#F08804]">Choice</span>
                </span>
                <span className="ml-1.5 text-[0.7rem] text-[#565959]">in &quot;{product.type}&quot;</span>
              </div>
            </div>

            {/* Amazon Price Block */}
            <div className="space-y-1 border-b border-[#E7E7E7] pb-3.5">
              {discountPercent > 0 && (
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#CC0C39] px-2 py-0.5 text-xs font-bold text-white uppercase">
                    Deal
                  </span>
                  <span className="text-sm font-bold text-[#CC0C39]">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-xs align-super text-[#0F1111] font-normal">₹</span>
                <span className="text-3xl font-medium tracking-tight text-[#0F1111]">
                  {price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-normal text-[#0F1111]">00</span>
              </div>

              {comparePrice && comparePrice > price && (
                <div className="text-xs text-[#565959]">
                  M.R.P.: <span className="line-through">{formatRupee(comparePrice)}</span>
                </div>
              )}

              <p className="text-xs text-[#565959]">Inclusive of all taxes</p>
              <p className="text-xs text-[#0F1111] font-medium">
                <strong>EMI</strong> starts at ₹{Math.round(price / 3)}. No Cost EMI available
              </p>
            </div>

            {/* Amazon Offers Section */}
            <div className="space-y-2 border-b border-[#E7E7E7] pb-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F1111]">
                <span>🏷️</span>
                <span>Offers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-[#D5D9D9] p-3 text-xs bg-white shadow-2xs hover:border-[#888C8C] transition-colors">
                  <span className="font-bold text-[#0F1111] block mb-1">Bank Offer</span>
                  <p className="text-[#565959] leading-snug line-clamp-2">
                    Upto ₹150 discount on select Credit Cards & UPI.
                  </p>
                  <span className="mt-2 block text-[#007185] font-medium hover:underline cursor-pointer">
                    2 offers ›
                  </span>
                </div>

                <div className="rounded-lg border border-[#D5D9D9] p-3 text-xs bg-white shadow-2xs hover:border-[#888C8C] transition-colors">
                  <span className="font-bold text-[#0F1111] block mb-1">Partner Offer</span>
                  <p className="text-[#565959] leading-snug line-clamp-2">
                    Get complimentary luxury aroma melt with your order.
                  </p>
                  <span className="mt-2 block text-[#007185] font-medium hover:underline cursor-pointer">
                    1 offer ›
                  </span>
                </div>

                <div className="rounded-lg border border-[#D5D9D9] p-3 text-xs bg-white shadow-2xs hover:border-[#888C8C] transition-colors">
                  <span className="font-bold text-[#0F1111] block mb-1">Pack Savings</span>
                  <p className="text-[#565959] leading-snug line-clamp-2">
                    Buy 2 or more gift sets and save an additional 10%.
                  </p>
                  <span className="mt-2 block text-[#007185] font-medium hover:underline cursor-pointer">
                    Details ›
                  </span>
                </div>
              </div>
            </div>

            {/* Amazon 4 Trust Icons Bar */}
            <div className="grid grid-cols-4 gap-2 border-b border-[#E7E7E7] py-3 text-center text-[0.72rem] text-[#007185]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🚚</span>
                <span className="leading-tight">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔄</span>
                <span className="leading-tight">7 Days Replacement</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🌿</span>
                <span className="leading-tight">100% Pure Soy Wax</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔒</span>
                <span className="leading-tight">Secure Transaction</span>
              </div>
            </div>

            {/* Product Specifications Table */}
            <div className="space-y-2 border-b border-[#E7E7E7] pb-4 text-xs">
              <h3 className="font-bold text-sm text-[#0F1111]">Product details</h3>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-transparent">
                    <td className="py-1 font-semibold text-[#565959] w-36">Brand</td>
                    <td className="py-1 text-[#0F1111]">Dev Creation</td>
                  </tr>
                  {product.fragrance && (
                    <tr>
                      <td className="py-1 font-semibold text-[#565959]">Scent</td>
                      <td className="py-1 text-[#0F1111] font-medium">{product.fragrance}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-1 font-semibold text-[#565959]">Item Form</td>
                    <td className="py-1 text-[#0F1111]">{product.type || 'Wax Sachet'}</td>
                  </tr>
                  {product.weight && (
                    <tr>
                      <td className="py-1 font-semibold text-[#565959]">Package Spec</td>
                      <td className="py-1 text-[#0F1111]">{product.weight}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-1 font-semibold text-[#565959]">Material Feature</td>
                    <td className="py-1 text-[#0F1111]">Plant-Based Soy, Botanical Essential Oils</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-[#565959]">Country of Origin</td>
                    <td className="py-1 text-[#0F1111]">India</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* "About this item" Bullet Points */}
            <div className="space-y-2 pb-4">
              <h3 className="font-bold text-sm text-[#0F1111]">About this item</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#0F1111] leading-relaxed">
                <li>
                  <strong>LONG-LASTING NATURAL AROMA:</strong> Infused with premium botanical fragrance oils providing an uplifting and calming ambiance in wardrobes, closets, drawers, and workspaces.
                </li>
                <li>
                  <strong>100% ORGANIC SOY WAX:</strong> Handcrafted with eco-conscious, non-toxic soy wax that is biodegradable, clean burning, and safe for linen and delicate clothing.
                </li>
                <li>
                  <strong>ARTISAN CRAFTED:</strong> Each sachet is hand-embellished with real dried flowers, botanicals, and a luxurious hanging ribbon.
                </li>
                <li>
                  <strong>READY TO GIFT:</strong> Elegantly presented in luxury packaging, making it an ideal gift for weddings, housewarmings, festive celebrations, and corporate hampers.
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMN 3: The Famous Amazon Buy Box */}
          <div className="rounded-lg border border-[#D5D9D9] p-4 text-xs bg-white shadow-sm lg:sticky lg:top-20 space-y-3.5">
            {/* Price display */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-[#0F1111]">₹</span>
                <span className="text-2xl font-bold text-[#0F1111]">
                  {price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#0F1111]">.00</span>
              </div>
              {comparePrice && comparePrice > price && (
                <div className="text-[0.72rem] text-[#565959] mt-0.5">
                  Save {formatRupee(comparePrice - price)} ({discountPercent}%)
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="space-y-1 text-xs">
              <div className="text-[#0F1111]">
                <strong className="text-[#007600]">FREE delivery</strong> <strong>{formattedDelivery}</strong>.
              </div>
              <div className="text-[#565959]">
                Order within <span className="text-[#007600] font-semibold">12 hrs 30 mins</span>
              </div>
              <div className="flex items-center gap-1 text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer pt-0.5">
                <span>📍</span>
                <span>Deliver to your location</span>
              </div>
            </div>

            {/* In Stock */}
            <div>
              {stock > 0 ? (
                <span className="text-lg font-bold text-[#007600] block">In stock</span>
              ) : (
                <span className="text-lg font-bold text-[#B12704] block">Currently unavailable</span>
              )}
            </div>

            {/* Quantity Selector */}
            {stock > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="quantity-select" className="text-xs font-semibold text-[#0F1111]">
                  Quantity:
                </label>
                <select
                  id="quantity-select"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="rounded-md border border-[#D5D9D9] bg-[#F0F2F2] px-2.5 py-1 text-xs font-medium text-[#0F1111] shadow-2xs outline-none focus:border-[#E77600]"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amazon CTA Buttons */}
            <div className="space-y-2 pt-1">
              {/* Add to Cart: Amazon Signature Yellow */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={stock <= 0 || adding || buying}
                className={cn(
                  'w-full rounded-full py-2.5 px-4 text-xs font-medium text-[#0F1111] shadow-xs transition-all active:scale-[0.98]',
                  'bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200]',
                  stock <= 0 && 'opacity-50 cursor-not-allowed',
                )}
              >
                {adding ? 'Adding to Cart...' : 'Add to Cart'}
              </button>

              {/* Buy Now: Amazon Signature Orange */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock <= 0 || buying || adding}
                className={cn(
                  'w-full rounded-full py-2.5 px-4 text-xs font-medium text-[#0F1111] shadow-xs transition-all active:scale-[0.98]',
                  'bg-[#FFA41C] hover:bg-[#FA8900] border border-[#FF8F00]',
                  stock <= 0 && 'opacity-50 cursor-not-allowed',
                )}
              >
                {buying ? 'Redirecting to Checkout...' : 'Buy Now'}
              </button>
            </div>

            {/* Secure Transaction & Fulfillment */}
            <div className="space-y-1.5 border-t border-[#E7E7E7] pt-3 text-[0.72rem] text-[#565959]">
              <div className="flex items-center gap-1.5 text-[#007185]">
                <span>🔒</span>
                <span>Secure transaction</span>
              </div>
              <div className="grid grid-cols-[70px_1fr] gap-1 pt-1">
                <span>Ships from</span>
                <span className="text-[#0F1111] font-medium">Dev Creation</span>
                <span>Sold by</span>
                <span className="text-[#0F1111] font-medium">Dev Creation Official</span>
              </div>
            </div>

            {/* Gift Options Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer border-t border-[#E7E7E7] pt-2 text-[0.75rem] text-[#0F1111]">
              <input
                type="checkbox"
                checked={giftOption}
                onChange={(e) => setGiftOption(e.target.checked)}
                className="rounded border-[#D5D9D9] text-[#E77600] focus:ring-[#E77600]"
              />
              <span>Add gift options at checkout</span>
            </label>

            {/* Add to Wish List Button */}
            <div className="border-t border-[#E7E7E7] pt-2">
              <button
                type="button"
                onClick={toggleWishlist}
                disabled={wishing}
                className="w-full rounded-md border border-[#D5D9D9] bg-[#F7FAFA] py-1.5 text-xs text-[#0F1111] hover:bg-[#EDF2F2] transition-colors"
              >
                {wishing ? 'Saving...' : 'Add to Wish List'}
              </button>
            </div>
          </div>
        </div>

        {/* Amazon "Customers Also Viewed" Section */}
        {related.length > 0 && (
          <div className="mt-14 border-t border-[#E7E7E7] pt-8">
            <h2 className="text-xl font-bold text-[#0F1111] mb-4">
              Inspired by your browsing history
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
