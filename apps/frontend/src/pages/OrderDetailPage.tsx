import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Package, Truck, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';
import { api } from '../lib/api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { SEO } from '../components/common/SEO';

export function OrderDetailPage() {
  const shouldReduceMotion = useReducedMotion();
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnGarment, setReturnGarment] = useState('');
  const [returnReason, setReturnReason] = useState('size_fit');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-detail', orderNumber],
    queryFn: () => api.get<any>(`/orders/${orderNumber}`),
    enabled: !!orderNumber,
  });

  useEffect(() => {
    if (order?.items?.[0]?.title_snapshot) {
      setReturnGarment(order.items[0].title_snapshot);
    }
  }, [order]);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReturn(true);
    try {
      await api.post('/returns', {
        orderId: order.id,
        orderNumber: order.order_number,
        garmentTitle: returnGarment || order.items?.[0]?.title_snapshot || 'Garment Item',
        size: order.items?.[0]?.size || 'M',
        reason: returnReason,
        comments: returnComments,
        refundAmount: order.total,
      });
      setReturnSuccess(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

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
      <SEO
        title={`Order Details #${orderNumber}`}
        description={`View details, items, delivery updates, and tracking for Bingooo order #${orderNumber}.`}
        noindex={true}
      />
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

      {/* Tracking Banner if shipped or tracking number exists */}
      {(order.tracking_number || order.status === 'shipped' || order.status === 'delivered') && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center shrink-0 shadow-sm">
              <Truck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block font-mono">
                Courier Shipment Dispatched
              </span>
              <p className="text-sm font-bold text-ink">
                Partner: <span className="font-extrabold">{order.carrier || 'Blue Dart Air Express'}</span> • AWB: <span className="font-mono font-black">{order.tracking_number || 'BLUEDART-88219412'}</span>
              </p>
            </div>
          </div>
          <Link
            to={`/track-order?awb=${order.tracking_number || 'BG-2026-9182'}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ink hover:bg-brand-red text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shrink-0"
          >
            <span>Track Live Shipment →</span>
          </Link>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Items */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-heading font-bold text-ink">Items Ordered</h3>
            {order.status === 'delivered' && (
              <button
                onClick={() => setReturnModalOpen(true)}
                className="text-xs font-bold text-brand-red hover:underline"
              >
                Request Return / Exchange
              </button>
            )}
          </div>
          <div className="space-y-3 divide-y divide-border">
            {order.items?.map((item: any) => (
              <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-caption">
                <div>
                  <span className="font-bold text-ink">{item.title_snapshot}</span>
                  <span className="text-muted block text-xs">
                    Qty {item.quantity} • SKU {item.sku || 'BING-GARMENT'}
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

      {/* Customer Return Request Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-wide text-ink">
                  Request Return / Exchange
                </h3>
                <span className="text-xs text-muted font-mono">Order #{order.order_number}</span>
              </div>
              <button
                onClick={() => setReturnModalOpen(false)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {returnSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white grid place-items-center mx-auto">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="text-sm font-bold text-emerald-900 uppercase">
                  Return Request Submitted
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Our Atelier Dispatch team has received your request. A reverse pickup will be scheduled within 24–48 business hours.
                </p>
                <button
                  onClick={() => {
                    setReturnModalOpen(false);
                    setReturnSuccess(false);
                  }}
                  className="px-4 py-2 bg-ink text-white rounded-lg text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                    Select Garment *
                  </label>
                  <select
                    value={returnGarment}
                    onChange={(e) => setReturnGarment(e.target.value)}
                    className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-brand-red"
                  >
                    {order.items?.map((it: any) => (
                      <option key={it.id} value={it.title_snapshot}>
                        {it.title_snapshot} (Qty {it.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                    Reason for Return / Exchange *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-xs font-bold text-ink focus:outline-none focus:border-brand-red"
                  >
                    <option value="size_fit">Size & Fit Issue (Need Exchange)</option>
                    <option value="print_defect">Print or Color Discrepancy</option>
                    <option value="wrong_item">Wrong Item Shipped</option>
                    <option value="fabric_feel">Fabric or GSM Quality Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                    Comments / Exchange Size Preference
                  </label>
                  <textarea
                    rows={3}
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    placeholder="e.g. Garment fit is slightly too relaxed, requesting size M exchange."
                    className="w-full px-3 py-2 bg-paper border border-border rounded-lg text-xs text-ink focus:outline-none focus:border-brand-red"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-muted hover:text-ink"
                    disabled={submittingReturn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
                  >
                    {submittingReturn ? 'Submitting...' : 'Submit Return'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
