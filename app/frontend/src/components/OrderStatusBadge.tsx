import { cn } from '@/lib/utils';
import type { OrderStatus, PaymentStatus } from '@/types';

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('inline-block rounded-full border px-3 py-1 font-util text-[0.58rem] uppercase tracking-[0.14em]', ORDER_STYLES[status])}>
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn('inline-block rounded-full border px-3 py-1 font-util text-[0.58rem] uppercase tracking-[0.14em]', PAYMENT_STYLES[status])}>
      {status}
    </span>
  );
}
