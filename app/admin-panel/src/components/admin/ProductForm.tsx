'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { Button, Spinner } from '@/components/ui';
import type { Category, Product, ProductImage } from '@/types';

interface FormState {
  name: string;
  type: string;
  fragrance: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  discountPercent: string;
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
  type: '',
  fragrance: '',
  description: '',
  category: '',
  price: '',
  compareAtPrice: '',
  discountPercent: '0',
  weight: '',
  stock: '0',
  sku: '',
  tags: '',
  isActive: true,
  isFeatured: false,
  images: [],
};

/**
 * Create/edit product form with multi-image upload (preview, progress, validation).
 * Only image URLs are persisted — files are uploaded to the storage service first.
 */
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    adminService.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        type: product.type,
        fragrance: product.fragrance ?? '',
        description: product.description ?? '',
        category: typeof product.category === 'object' && product.category ? product.category._id : '',
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
        discountPercent: String(product.discountPercent ?? 0),
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

  const removeImage = (url: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((im) => im.url !== url) }));

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
    const payload = {
      name: form.name,
      type: form.type,
      fragrance: form.fragrance,
      description: form.description,
      category: form.category || null,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      discountPercent: Number(form.discountPercent) || 0,
      weight: form.weight || undefined,
      stock: Number(form.stock),
      sku: form.sku || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      images: form.images,
    };
    try {
      if (product) {
        await adminService.updateProduct(product._id, payload);
        success('Product updated');
      } else {
        await adminService.createProduct(payload);
        success('Product created');
      }
      router.push('/products');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 rounded-xl border border-line bg-white p-6 shadow-sm">
        <Field label="Name" value={form.name} onChange={(v) => set('name', v)} error={errors.name} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type" value={form.type} onChange={(v) => set('type', v)} error={errors.type} placeholder="e.g. Wax Melts" />
          <Field label="Fragrance" value={form.fragrance} onChange={(v) => set('fragrance', v)} />
        </div>
        <label className="block">
          <span className="util-label">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" type="number" value={form.price} onChange={(v) => set('price', v)} error={errors.price} />
          <Field label="Compare-at (₹)" type="number" value={form.compareAtPrice} onChange={(v) => set('compareAtPrice', v)} />
          <Field label="Discount %" type="number" value={form.discountPercent} onChange={(v) => set('discountPercent', v)} />
          <Field label="Stock" type="number" value={form.stock} onChange={(v) => set('stock', v)} error={errors.stock} />
          <Field label="Weight" value={form.weight} onChange={(v) => set('weight', v)} placeholder="e.g. 50g" />
          <Field label="SKU (optional)" value={form.sku} onChange={(v) => set('sku', v)} placeholder="auto-generated" />
        </div>
        <Field label="Tags (comma separated)" value={form.tags} onChange={(v) => set('tags', v)} placeholder="100% Handmade, Long Lasting" />
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <span className="util-label">Category</span>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          >
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Active (visible in store)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
              Featured
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <span className="util-label">Images</span>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {form.images.map((img) => (
              <div key={img.url} className="group relative aspect-square overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.url)}
                  className="absolute right-1 top-1 rounded bg-black/60 px-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-ink-3 hover:border-gold">
              {uploading ? <Spinner className="text-gold" /> : <span className="text-2xl">+</span>}
              <input type="file" accept="image/*" multiple hidden onChange={onUpload} disabled={uploading} />
            </label>
          </div>
          <p className="mt-2 text-[0.7rem] text-ink-3">JPG, PNG, WEBP or AVIF up to 5MB each.</p>
        </div>

        <Button type="submit" loading={saving} className="w-full">
          {product ? 'Save changes' : 'Create product'}
        </Button>
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
        className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
