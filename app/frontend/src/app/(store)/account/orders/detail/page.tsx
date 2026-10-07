import { Suspense } from 'react';
import { OrderDetailClient } from '../[id]/OrderDetailClient';

export default function OrderDetailQueryPage() {
  return (
    <Suspense fallback={null}>
      <OrderDetailClient />
    </Suspense>
  );
}
