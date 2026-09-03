import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

interface NotificationAlert {
  id: string;
  category: 'order' | 'custom' | 'stock' | 'payment';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  linkHref?: string;
  linkText?: string;
  isRead: boolean;
  created_at: string;
}

const initialNotifications: NotificationAlert[] = [
  {
    id: 'notif-1',
    category: 'stock',
    severity: 'critical',
    title: 'Low Stock Alert: Heavyweight Boxy Tee (L, Black)',
    description: 'Only 3 units remain in physical warehouse stock. Low threshold is 5 units.',
    linkHref: '/inventory',
    linkText: 'Adjust Stock in Inventory →',
    isRead: false,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'notif-2',
    category: 'custom',
    severity: 'warning',
    title: 'New Custom Studio Print Submission (#BING-CUST-9102)',
    description: 'Customer uploaded 300 DPI backprint artwork awaiting DTG production approval.',
    linkHref: '/custom-orders',
    linkText: 'Review in Custom Queue →',
    isRead: false,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'notif-3',
    category: 'order',
    severity: 'info',
    title: 'New High-Value Order Placed (#BING-89421)',
    description: 'Order total of ₹2,498 confirmed via Razorpay UPI.',
    linkHref: '/orders',
    linkText: 'View Order →',
    isRead: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'notif-4',
    category: 'payment',
    severity: 'warning',
    title: 'Payment Verification Check',
    description: 'Razorpay webhook signature verified for Order #BING-89419.',
    linkHref: '/payments',
    linkText: 'Inspect Payment Ledger →',
    isRead: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationAlert[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast({ title: 'All notifications marked as read', variant: 'success' });
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: 'Notification dismissed', variant: 'success' });
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'critical') return n.severity === 'critical';
    return true;
  });

  const getSeverityBadge = (severity: NotificationAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-danger/15 px-2 py-0.5 text-[10px] font-bold uppercase text-danger">
            <AlertTriangle size={11} /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-red">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Bell size={14} /> Operations Alerts
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Operations Notification Center
          </h2>
          <p className="text-xs text-muted">
            Live telemetry alerts for low stock triggers, customer studio artwork queues, and fulfillment checkpoints.
          </p>
        </div>

        <button onClick={markAllAsRead} className="btn-secondary text-xs">
          <CheckCircle2 size={14} /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${notifications.filter((n) => !n.isRead).length})` },
          { key: 'critical', label: 'Critical Only' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              filter === tab.key
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-2xl border p-5 transition-all ${
              notif.isRead
                ? 'border-border bg-white'
                : 'border-brand-red/30 bg-[#FDF9F4] shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    notif.severity === 'critical'
                      ? 'bg-danger/10 text-danger'
                      :                    notif.severity === 'warning'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-brand-red/10 text-brand-red'
                  }`}
                >
                  {notif.category === 'stock' && <AlertTriangle size={18} />}
                  {notif.category === 'custom' && <Sparkles size={18} />}
                  {notif.category === 'order' && <ShoppingBag size={18} />}
                  {notif.category === 'payment' && <CreditCard size={18} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink text-sm">{notif.title}</h3>
                    {getSeverityBadge(notif.severity)}
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-red" />
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{notif.description}</p>
                  {notif.linkHref && (
                    <Link
                      to={notif.linkHref}
                      className="inline-block pt-1 text-xs font-bold text-brand-red hover:underline"
                    >
                      {notif.linkText}
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start text-xs text-muted">
                <span>{formatDate(notif.created_at)}</span>
                <button
                  onClick={() => toggleRead(notif.id)}
                  className="p-1 text-muted hover:text-ink rounded"
                  title={notif.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  <CheckCircle2 size={16} className={notif.isRead ? 'text-success' : 'text-muted'} />
                </button>
                <button
                  onClick={() => deleteNotif(notif.id)}
                  className="p-1 text-muted hover:text-danger rounded"
                  title="Dismiss notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
