import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export function OrderSuccessPage() {
  const location = useLocation();
  const order = (location.state as any)?.order;

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const address = order.address_snapshot_json || {};

  return (
    <div className="container-narrow py-12 sm:py-16">
      <div className="text-center mb-6">
        <Logo variant="red" size="lg" withLink />
      </div>
      <div className="rounded-2xl border border-border bg-white p-8 sm:p-12 shadow-sm text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-6">
          <CheckCircle2 size={44} />
        </div>

        <span className="text-caption font-bold text-accent uppercase tracking-widest">
          Payment Confirmed
        </span>
        <h1 className="text-display-lg font-bold text-ink mt-1">Thank You for Your Order!</h1>
        <p className="mt-2 text-body text-muted max-w-md mx-auto">
          We've received your order and our workshop is getting it ready for production and shipping.
        </p>

        {/* Order Meta Card */}
        <div className="mt-8 rounded-xl bg-paper border border-border p-6 text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <span className="text-caption text-muted block">Order Number</span>
              <strong className="text-body font-black text-ink">{order.order_number}</strong>
            </div>
            <div className="text-right">
              <span className="text-caption text-muted block">Total Paid</span>
              <strong className="text-body font-black text-ink">₹{order.total}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption">
            <div>
              <span className="text-muted block font-semibold mb-1">Delivering To:</span>
              <p className="text-ink font-medium">
                {address.name}<br />
                {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                {address.city}, {address.state} - {address.postalCode}
              </p>
            </div>
            <div>
              <span className="text-muted block font-semibold mb-1">Estimated Delivery:</span>
              <p className="text-ink font-medium">
                3-5 Business Days (Express Tracked Shipping)
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/account/orders">
            <Button variant="secondary" size="lg">
              <Package size={18} />
              View Order History
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="primary" size="lg">
              Continue Shopping
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
