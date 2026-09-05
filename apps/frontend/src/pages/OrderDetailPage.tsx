import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Package, Truck, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';
import { api } from '../lib/api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export function OrderDetailPage() {
  const shouldReduceMotion = useReducedMotion();
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-detail', orderNumber],
    queryFn: () => api.get<any>(`/orders/${orderNumber}`),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return <div className="container-page py-16 text-center text-muted">Loading order details...</div>;
  }

  if (isError || !order) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="text-heading font-bold text-ink">Order Not Found</h2>
        <p className="mt-2 text-body text-muted">We could not find an order with number {orderNumber}.</p>
        <Link to="/account/orders" className="mt-6 inline-block">
          <Button variant="primary">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const address = order.address_snapshot_json || {};

  return (
    <div className="container-page py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-caption font-semibold text-muted hover:text-ink transition-colors">
          <ArrowLeft size={16} /> Back to All Orders
        </Link>
        <Logo variant="red" size="sm" withLink />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-caption text-muted block">Official Order Receipt</span>
          <h1 className="text-display-lg font-bold text-ink">{order.order_number}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={order.status === 'delivered' ? 'success' : 'accent'} size="lg">
            {order.status.toUpperCase()}
          </Badge>
          <span className="text-2xl font-extrabold text-ink">₹{order.total}</span>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-heading font-bold text-ink">Delivery Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {[
            { label: 'Order Placed', done: true, icon: CheckCircle2 },
            { label: 'In Production', done: order.status !== 'pending_payment', icon: Clock },
            { label: 'Shipped', done: order.status === 'shipped' || order.status === 'delivered', icon: Truck },
            { label: 'Delivered', done: order.status === 'delivered', icon: Package },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  step.done ? 'bg-success/5 border-success/30 text-success' : 'bg-paper border-border text-muted'
                }`}
              >
                <Icon size={20} />
                <span className="text-caption font-bold text-ink">{step.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Items */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-heading font-bold text-ink">Items Ordered</h3>
          <div className="space-y-3 divide-y divide-border">
            {order.items?.map((item: any) => (
              <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-caption">
                <div>
                  <span className="font-bold text-ink">{item.title_snapshot}</span>
                  <span className="text-muted block text-xs">
                    Qty {item.quantity} • SKU {item.sku}
                  </span>
                </div>
                <span className="font-bold text-ink">₹{item.total}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-caption">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span className="font-semibold">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>Shipping Fee</span>
              <span className="font-semibold text-ink">₹{order.shipping_fee}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>GST Tax</span>
              <span className="font-semibold text-ink">₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-body font-black text-ink pt-2 border-t border-border">
              <span>Total Amount</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address & Payment */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-heading font-bold text-ink">Shipping Address</h3>
            <p className="text-caption text-ink font-medium leading-relaxed">
              <strong>{address.name}</strong><br />
              {address.phone}<br />
              {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
              {address.city}, {address.state} - {address.postalCode}<br />
              {address.country === 'IN' ? 'India' : address.country}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-heading font-bold text-ink">Payment Method</h3>
            <div className="flex items-center justify-between text-caption">
              <span className="text-muted">Type:</span>
              <span className="font-bold text-ink uppercase">{order.payment_method}</span>
            </div>
            <div className="flex items-center justify-between text-caption">
              <span className="text-muted">Payment Status:</span>
              <Badge variant={order.payment_status === 'captured' ? 'success' : 'default'}>
                {order.payment_status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
