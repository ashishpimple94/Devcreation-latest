import { Suspense } from 'react';
import { ProductEditClient } from './ProductEditClient';
import { Skeleton } from '@/components/ui';

export function generateStaticParams() {
  return [{ id: 'edit' }];
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ProductEditClient />
    </Suspense>
  );
}
