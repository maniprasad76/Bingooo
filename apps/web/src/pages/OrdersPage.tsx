import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { api } from '../lib/api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => api.get<any[]>('/orders'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'shipped':
        return <Badge variant="accent">Shipped</Badge>;
      case 'processing':
      case 'paid':
        return <Badge variant="default">In Production</Badge>;
      case 'pending_payment':
        return <Badge variant="danger">Payment Pending</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="container-page py-8 sm:py-12 space-y-6">
      <div className="pb-6 border-b border-border">
        <h1 className="text-display-lg font-bold text-ink">My Orders</h1>
        <p className="text-body text-muted">Track deliveries and view order history</p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-paper/50">
          <div className="h-16 w-16 rounded-full bg-paper flex items-center justify-center mb-4 text-muted">
            <Package size={28} />
          </div>
          <h3 className="text-heading font-bold text-ink">No orders found</h3>
          <p className="mt-1 text-body text-muted max-w-sm">
            You haven't placed any orders yet. Discover our latest collections.
          </p>
          <Link to="/shop" className="mt-6">
            <Button variant="primary">Shop Now</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <span className="text-caption text-muted block">Order ID</span>
                  <strong className="text-body font-bold text-ink">{order.order_number}</strong>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-body font-bold text-ink">₹{order.total}</span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-caption">
                    <div>
                      <span className="font-semibold text-ink">{item.title_snapshot}</span>
                      <span className="text-muted ml-2">Qty {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-ink">₹{item.total}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border text-caption text-muted">
                <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                <Link
                  to={`/account/orders/${order.order_number}`}
                  className="flex items-center gap-1 font-semibold text-accent hover:text-accent-dark"
                >
                  View Details & Tracking <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
