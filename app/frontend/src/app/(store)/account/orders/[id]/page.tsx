import { OrderDetailClient } from './OrderDetailClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: 'sample' }];
}

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
