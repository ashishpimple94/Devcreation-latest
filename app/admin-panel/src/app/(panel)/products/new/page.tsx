import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-medium text-ink">New product</h1>
      <ProductForm />
    </div>
  );
}
