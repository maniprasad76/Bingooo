import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export interface NotificationAlert {
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

export function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => api.get<NotificationAlert[]>('/notifications'),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      toast({ title: 'All notifications marked as read', variant: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Operation failed', description: err.message, variant: 'danger' });
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      api.patch(`/notifications/${id}/read`, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      toast({ title: 'Notification dismissed', variant: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Dismissal failed', description: err.message, variant: 'danger' });
    },
  });

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'critical') return n.severity === 'critical';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: NotificationAlert['category']) => {
    switch (category) {
      case 'stock':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'custom':
        return <Sparkles size={16} className="text-brand-red" />;
      case 'order':
        return <ShoppingBag size={16} className="text-ink" />;
      case 'payment':
        return <CreditCard size={16} className="text-success" />;
      default:
        return <Info size={16} className="text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Bell size={14} /> Operations Dispatch
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Store Alerts & Production Notifications
          </h2>
          <p className="text-xs text-muted">
            Real-time telemetry regarding warehouse inventory depletion, new orders, and print approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink hover:border-brand-red hover:text-brand-red transition-colors shadow-xs"
            >
              <CheckCircle2 size={13} /> Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-admin p-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Alerts (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'critical', label: 'Critical Only' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-brand-red text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card-admin overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
            <LoaderCircle size={22} className="animate-spin text-brand-red" />
            <span className="text-xs font-bold uppercase tracking-wider">Syncing alert dispatch...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
            <CheckCircle2 size={32} className="text-success mb-2" />
            <p className="text-sm font-bold text-ink">All caught up!</p>
            <p className="text-xs text-muted">No unhandled operational notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`flex flex-wrap items-start justify-between gap-4 p-5 transition-colors ${
                  notif.isRead ? 'bg-white' : 'bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-border shadow-xs mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs ${notif.isRead ? 'font-bold text-ink' : 'font-black text-ink'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-brand-red" />
                      )}
                    </div>

                    <p className="text-xs text-muted leading-relaxed max-w-xl">
                      {notif.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      <span className="text-muted">{formatDate(notif.created_at)}</span>
                      {notif.linkHref && (
                        <Link
                          to={notif.linkHref}
                          className="font-bold text-brand-red hover:underline inline-flex items-center gap-1"
                        >
                          {notif.linkText || 'Inspect Details →'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      toggleReadMutation.mutate({ id: notif.id, isRead: !notif.isRead })
                    }
                    className="rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-muted hover:text-ink transition-colors"
                  >
                    {notif.isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(notif.id)}
                    className="rounded-lg border border-border bg-white p-1 text-muted hover:text-brand-red transition-colors"
                    title="Dismiss"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
