import { ProductEditClient } from './ProductEditClient';

export function generateStaticParams() {
  return [{ id: 'edit' }];
}

export default function EditProductPage() {
  return <ProductEditClient />;
}
