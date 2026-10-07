import { OrderDetailClient } from './OrderDetailClient';

export function generateStaticParams() {
  return [{ id: 'detail' }];
}

export default function AdminOrderDetailPage() {
  return <OrderDetailClient />;
}
