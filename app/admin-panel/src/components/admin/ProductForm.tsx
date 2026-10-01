'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { Button, Spinner } from '@/components/ui';
import { ProductPreviewCard } from '@/components/admin/ProductPreviewCard';
import type { Category, Product, ProductImage } from '@/types';
import { formatRupee, cn } from '@/lib/utils';

interface FormState {
  name: string;
  type: string;
  fragrance: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  discountPercent: string;
  offerBadge: string;
  packType: string;
  boxContents: string;
  weight: string;
  stock: string;
  sku: string;
  tags: string;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImage[];
}

const empty: FormState = {
  name: '',
  type: 'Wax Sachet',
  fragrance: '',
  description: '',
  category: '',
  price: '',
  compareAtPrice: '',
  discountPercent: '0',
  offerBadge: '',
  packType: 'Single Sachet',
  boxContents: '',
  weight: '100g',
  stock: '25',
  sku: '',
  tags: '100% Pure Soy, Handcrafted',
  isActive: true,
  isFeatured: false,
  images: [],
};

const PACK_PRESETS = [
  { label: 'Single Sachet', weight: '100g', type: 'Wax Sachet' },
  { label: 'Pack of 2', weight: '200g (2 Sachets)', type: 'Wax Sachet Pack' },
  { label: 'Pack of 4 (Festive Edition)', weight: '400g (4 Sachets)', type: 'Gift Set' },
  { label: 'Luxury Wax Melt Gift Box', weight: 'Gift Box', type: 'Gift Set' },
  { label: 'Aroma Stone Set (4-Piece)', weight: '4 pcs', type: 'Aroma Stones' },
  { label: 'Custom Luxury Hamper', weight: 'Grand Gift Box', type: 'Gift Set' },
];

const OFFER_PRESETS = [
  'Festive Offer',
  'Special Discount',
  'Buy 1 Get 1',
  'Limited Edition',
  'Weekend Deal',
  'Best Value Pack',
];

const SAMPLE_ASSETS = [
  { label: 'Wax Sachet 1', url: '/assets/Gifting/1.jpeg' },
  { label: 'Wax Sachet 2', url: '/assets/Gifting/2.jpeg' },
  { label: 'Wax Sachet 3', url: '/assets/Gifting/3.jpeg' },
  { label: 'Wax Melt Gift Box', url: '/assets/Gifting/Waxset.png' },
  { label: 'Chocolate Candle Set', url: '/assets/Gifting/Pasted image (3).png' },
  { label: 'Aroma Stone Set', url: '/assets/Gifting/Pasted image (2).png' },
  { label: 'Ocean Breeze Melt', url: '/assets/Gifting/Pasted image.png' },
];

/**
 * Enterprise Product Management Form with:
 * - Special Offer / Deal Section
 * - Packs & Gift Sets Configuration
 * - Multi-image Manager with Primary Selection & Reordering
 * - 1:1 Live Storefront Preview Card
 */
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [previewTab, setPreviewTab] = useState<'both' | 'preview'>('both');

  useEffect(() => {
    adminService.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (product) {
      // Extract offer tag if previously saved
      const foundOffer = OFFER_PRESETS.find((o) => product.tags.includes(o)) || '';

      setForm({
        name: product.name,
        type: product.type,
        fragrance: product.fragrance ?? '',
        description: product.description ?? '',
        category: typeof product.category === 'object' && product.category ? product.category._id : '',
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
        discountPercent: String(product.discountPercent ?? 0),
        offerBadge: foundOffer,
        packType: product.weight || 'Single Sachet',
        boxContents: '',
        weight: product.weight ?? '',
        stock: String(product.stock),
        sku: product.sku,
        tags: product.tags.join(', '),
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: product.images ?? [],
      });
    }
  }, [product]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Price & Discount auto-calculators
  const handleCompareAtChange = (val: string) => {
    const comp = Number(val);
    const curPrice = Number(form.price);
    let disc = form.discountPercent;
    if (comp > 0 && curPrice > 0 && comp >= curPrice) {
      disc = String(Math.round(((comp - curPrice) / comp) * 100));
    }
    setForm((f) => ({ ...f, compareAtPrice: val, discountPercent: disc }));
  };

  const handlePriceChange = (val: string) => {
    const p = Number(val);
    const comp = Number(form.compareAtPrice);
    let disc = form.discountPercent;
    if (comp > 0 && p > 0 && comp >= p) {
      disc = String(Math.round(((comp - p) / comp) * 100));
    }
    setForm((f) => ({ ...f, price: val, discountPercent: disc }));
  };

  const handleDiscountChange = (val: string) => {
    const disc = Number(val);
    const comp = Number(form.compareAtPrice);
    let p = form.price;
    if (comp > 0 && disc >= 0 && disc <= 100) {
      p = String(Math.round(comp * (1 - disc / 100)));
    }
    setForm((f) => ({ ...f, discountPercent: val, price: p }));
  };

  // Image actions
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await adminService.uploadImages(files);
      setForm((f) => ({
        ...f,
        images: [
          ...f.images,
          ...uploaded.map((u, i) => ({ url: u.url, alt: f.name, isPrimary: f.images.length === 0 && i === 0 })),
        ],
      }));
      success(`${uploaded.length} image(s) uploaded`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setForm((f) => ({
      ...f,
      images: [
        ...f.images,
        { url: customImageUrl.trim(), alt: f.name, isPrimary: f.images.length === 0 },
      ],
    }));
    setCustomImageUrl('');
    success('Image added');
  };

  const setPrimaryImage = (index: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.map((im, i) => ({ ...im, isPrimary: i === index })),
    }));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setForm((f) => {
      const arr = [...f.images];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return f;
      const temp = arr[index];
      arr[index] = arr[target];
      arr[target] = temp;
      return { ...f, images: arr };
    });
  };

  const removeImage = (url: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((im) => im.url !== url) }));

  const selectPackPreset = (preset: (typeof PACK_PRESETS)[number]) => {
    setForm((f) => ({
      ...f,
      packType: preset.label,
      weight: preset.weight,
      type: preset.type,
      tags: Array.from(new Set([...f.tags.split(',').map((t) => t.trim()), preset.label]))
        .filter(Boolean)
        .join(', '),
    }));
  };

  const selectOfferPreset = (offer: string) => {
    setForm((f) => ({
      ...f,
      offerBadge: f.offerBadge === offer ? '' : offer,
    }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Name is required';
    if (!form.type.trim()) next.type = 'Type is required';
    if (!form.price || Number(form.price) < 0) next.price = 'Valid price required';
    if (Number(form.stock) < 0) next.stock = 'Stock cannot be negative';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    // Merge offer badge & pack type into tags for searchability
    const rawTags = form.tags.split(',').map((t) => t.trim());
    if (form.offerBadge) rawTags.push(form.offerBadge);
    if (form.packType) rawTags.push(form.packType);
    const cleanedTags = Array.from(new Set(rawTags.filter(Boolean)));

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      type: form.type.trim(),
      fragrance: form.fragrance.trim(),
      description: form.boxContents
        ? `${form.description}\n\nBox Contents: ${form.boxContents}`.trim()
        : form.description.trim(),
      price: Number(form.price),
      discountPercent: Number(form.discountPercent) || 0,
      stock: Number(form.stock) || 0,
      tags: cleanedTags,
      isActive: Boolean(form.isActive),
      isFeatured: Boolean(form.isFeatured),
      images: form.images.map((im) => ({
        url: im.url.trim(),
        alt: im.alt?.trim() || form.name.trim(),
        isPrimary: Boolean(im.isPrimary),
      })),
    };

    if (form.category && form.category.trim().length === 24) {
      payload.category = form.category.trim();
    } else {
      payload.category = null;
    }

    if (Number(form.compareAtPrice) > 0) {
      payload.compareAtPrice = Number(form.compareAtPrice);
    }

    if (form.weight?.trim() || form.packType?.trim()) {
      payload.weight = form.weight?.trim() || form.packType?.trim();
    }

    if (form.sku?.trim()) {
      payload.sku = form.sku.trim();
    }

    try {
      if (product) {
        await adminService.updateProduct(product._id, payload);
        success('Product updated successfully');
      } else {
        await adminService.createProduct(payload);
        success('Product created successfully');
      }
      router.push('/products');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const tagsList = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (form.offerBadge) tagsList.push(form.offerBadge);

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
      {/* Left Column: Form Fields */}
      <div className="space-y-6">
        {/* Basic Details */}
        <div className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-xs">
          <h2 className="font-display text-xl font-medium text-ink">Product Identity</h2>

          <Field
            label="Product Name"
            value={form.name}
            onChange={(v) => set('name', v)}
            error={errors.name}
            placeholder="e.g. French Lavender Luxury Sachet"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Product Type"
              value={form.type}
              onChange={(v) => set('type', v)}
              error={errors.type}
              placeholder="e.g. Wax Sachet, Gift Set"
            />
            <Field
              label="Signature Fragrance"
              value={form.fragrance}
              onChange={(v) => set('fragrance', v)}
              placeholder="e.g. French Lavender · Vanilla"
            />
          </div>

          <label className="block">
            <span className="util-label">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describe fragrance notes, botanical wax blend, and ideal spaces..."
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-gold"
            />
          </label>
        </div>

        {/* Section 1: Offer & Discounts */}
        <div className="space-y-5 rounded-2xl border border-gold/40 bg-gradient-to-br from-white via-surface-2/60 to-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-flame/15 px-2.5 py-0.5 font-util text-[0.6rem] font-bold uppercase tracking-wider text-flame">
                🔥 Special Offer & Deals
              </span>
              <h2 className="mt-1 font-display text-xl font-medium text-ink">Offers & Pricing</h2>
            </div>
            {Number(form.discountPercent) > 0 && (
              <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 font-util text-xs font-bold text-gold-dk">
                {form.discountPercent}% OFF ACTIVE
              </span>
            )}
          </div>

          {/* Quick Offer Preset Buttons */}
          <div>
            <span className="util-label">Offer Badge on Card</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {OFFER_PRESETS.map((offer) => {
                const isSelected = form.offerBadge === offer;
                return (
                  <button
                    key={offer}
                    type="button"
                    onClick={() => selectOfferPreset(offer)}
                    className={cn(
                      'rounded-full border px-3 py-1 font-util text-xs transition-all',
                      isSelected
                        ? 'border-flame bg-flame text-white shadow-xs'
                        : 'border-line bg-white text-ink-2 hover:border-gold hover:text-ink',
                    )}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {offer}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={form.offerBadge}
              onChange={(e) => set('offerBadge', e.target.value)}
              placeholder="Or write custom badge (e.g. Diwali Dhamaka Deal)"
              className="mt-2.5 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs outline-none focus:border-gold"
            />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="Original Price (₹ Compare-at)"
              type="number"
              value={form.compareAtPrice}
              onChange={handleCompareAtChange}
              placeholder="e.g. 699"
            />
            <Field
              label="Selling / Offer Price (₹)"
              type="number"
              value={form.price}
              onChange={handlePriceChange}
              error={errors.price}
              placeholder="e.g. 499"
            />
            <Field
              label="Discount %"
              type="number"
              value={form.discountPercent}
              onChange={handleDiscountChange}
              placeholder="e.g. 25"
            />
          </div>

          {/* Live Savings Callout */}
          {Number(form.compareAtPrice) > Number(form.price) && Number(form.price) > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-600/30 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-800">
              <span className="font-medium">
                Customer Savings: <strong>{formatRupee(Number(form.compareAtPrice) - Number(form.price))}</strong> (
                {form.discountPercent}% OFF)
              </span>
              <span className="font-util text-[0.65rem] font-bold uppercase text-emerald-700">Attractive Deal</span>
            </div>
          )}
        </div>

        {/* Section 2: Packs & Gift Sets */}
        <div className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-0.5 font-util text-[0.6rem] font-bold uppercase tracking-wider text-gold-dk">
                🎁 Packs & Gift Sets
              </span>
              <h2 className="mt-1 font-display text-xl font-medium text-ink">Pack Configuration</h2>
            </div>
          </div>

          <div>
            <span className="util-label">Select Pack / Gift Box Style</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PACK_PRESETS.map((preset) => {
                const isSelected = form.packType === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => selectPackPreset(preset)}
                    className={cn(
                      'flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                      isSelected
                        ? 'border-gold bg-surface-2 text-ink shadow-xs ring-1 ring-gold'
                        : 'border-line bg-white hover:border-gold/60',
                    )}
                  >
                    <span className="font-body text-xs font-semibold text-ink">{preset.label}</span>
                    <span className="mt-0.5 font-util text-[0.6rem] text-ink-3">{preset.weight}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Pack Label / Weight Specification"
              value={form.weight}
              onChange={(v) => set('weight', v)}
              placeholder="e.g. Pack of 2 (200g), Luxury Gift Box"
            />
            <Field
              label="Stock Available (Units)"
              type="number"
              value={form.stock}
              onChange={(v) => set('stock', v)}
              error={errors.stock}
              placeholder="e.g. 50"
            />
          </div>

          <label className="block">
            <span className="util-label">Gift Box Contents / What’s Inside</span>
            <input
              type="text"
              value={form.boxContents}
              onChange={(e) => set('boxContents', e.target.value)}
              placeholder="e.g. 2x Sachets (Lavender & Rose) + 1x Velvet Keepsake Pouch + Gold Wax Seal"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs outline-none focus:border-gold"
            />
          </label>
        </div>

        {/* Inventory, SKU & Category */}
        <div className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-xs">
          <h2 className="font-display text-xl font-medium text-ink">Inventory & Classification</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className="util-label">Category</span>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="SKU (Stock Keeping Unit)"
              value={form.sku}
              onChange={(v) => set('sku', v)}
              placeholder="e.g. DC-LAV-PK2 (auto-generated if empty)"
            />
          </div>

          <Field
            label="Search Tags (comma separated)"
            value={form.tags}
            onChange={(v) => set('tags', v)}
            placeholder="100% Pure Soy, Wardrobe Freshener, Ready to Gift"
          />

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink font-medium">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-line text-gold focus:ring-gold"
              />
              Active (Visible in Storefront)
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink font-medium">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="h-4 w-4 rounded border-line text-gold focus:ring-gold"
              />
              Feature on Homepage
            </label>
          </div>
        </div>
      </div>

      {/* Right Column: Image Manager & Live E-Commerce Card Preview */}
      <div className="space-y-6">
        {/* Section 3: Enhanced Image Manager */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-ink">Product Images</h2>
            <span className="font-util text-[0.62rem] text-ink-3">
              {form.images.length} {form.images.length === 1 ? 'image' : 'images'}
            </span>
          </div>

          {/* Image Thumbnails with Reordering & Primary Selection */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {form.images.map((img, idx) => (
              <div
                key={img.url + idx}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all',
                  img.isPrimary ? 'border-gold shadow-sm ring-2 ring-gold/20' : 'border-line',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />

                {/* Primary Badge */}
                {img.isPrimary && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-gold px-1.5 py-0.5 font-util text-[0.52rem] font-bold text-white shadow-xs">
                    Primary
                  </span>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-1.5 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(idx)}
                      title="Set as Primary"
                      className="rounded bg-white/90 px-1.5 py-0.5 font-util text-[0.52rem] font-bold text-ink hover:bg-gold hover:text-white"
                    >
                      {img.isPrimary ? '★ Primary' : 'Set Primary'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.url)}
                      title="Remove"
                      className="rounded bg-red-600/90 px-1.5 py-0.5 text-xs text-white hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'left')}
                      className="rounded bg-white/80 px-2 py-0.5 text-xs text-ink hover:bg-white disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={idx === form.images.length - 1}
                      onClick={() => moveImage(idx, 'right')}
                      className="rounded bg-white/80 px-2 py-0.5 text-xs text-ink hover:bg-white disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Upload Box */}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line text-ink-3 transition-colors hover:border-gold hover:text-gold">
              {uploading ? (
                <Spinner className="text-gold" />
              ) : (
                <>
                  <span className="text-2xl font-light">+</span>
                  <span className="font-util text-[0.6rem] uppercase tracking-wider">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" multiple hidden onChange={onUpload} disabled={uploading} />
            </label>
          </div>

          {/* Quick URL Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="url"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="Paste image link URL..."
              className="flex-1 rounded-xl border border-line bg-white px-3 py-1.5 text-xs outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-xl border border-deep bg-deep px-3 py-1.5 font-util text-[0.65rem] uppercase tracking-wider text-white hover:bg-[#3D2A1E]"
            >
              Add
            </button>
          </div>

          {/* Sample Brand Assets Selector */}
          <div className="mt-4 border-t border-line-soft pt-3">
            <span className="font-util text-[0.58rem] uppercase tracking-wider text-copper">
              Or pick from sample brand assets:
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SAMPLE_ASSETS.map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => {
                    if (form.images.some((i) => i.url === sample.url)) return;
                    setForm((f) => ({
                      ...f,
                      images: [
                        ...f.images,
                        { url: sample.url, alt: f.name || sample.label, isPrimary: f.images.length === 0 },
                      ],
                    }));
                  }}
                  className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-util text-[0.58rem] text-ink-2 hover:border-gold hover:text-ink"
                >
                  + {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: 1:1 Live Storefront Product Card Preview */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <ProductPreviewCard
            name={form.name}
            type={form.type}
            fragrance={form.fragrance}
            description={form.description}
            price={Number(form.price) || 0}
            compareAtPrice={form.compareAtPrice ? Number(form.compareAtPrice) : undefined}
            discountPercent={Number(form.discountPercent) || 0}
            offerBadge={form.offerBadge}
            packType={form.packType}
            weight={form.weight}
            tags={tagsList}
            images={form.images}
            stock={Number(form.stock) || 0}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button type="submit" loading={saving} className="w-full py-3.5 text-sm">
            {product ? 'Save & Update Product' : 'Publish Product to Store'}
          </Button>

          <button
            type="button"
            onClick={() => router.push('/products')}
            className="w-full rounded-xl border border-line py-2.5 font-util text-[0.7rem] uppercase tracking-wider text-ink-2 hover:bg-surface-2"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="util-label">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-gold"
      />
      {error && <span className="mt-1 block text-xs text-red-600 font-medium">{error}</span>}
    </label>
  );
}
