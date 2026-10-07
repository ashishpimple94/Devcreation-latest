import { OrderDetailClient } from './OrderDetailClient';

export function generateStaticParams() {
  return [{ id: 'sample' }];
}

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
