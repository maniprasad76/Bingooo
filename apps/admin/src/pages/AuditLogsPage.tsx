import { useState } from 'react';
import {
  History,
  Search,
  Shield,
  User,
  Clock,
  Filter,
  ArrowRight,
  Database,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  created_at: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-101',
    adminEmail: 'admin@bingooo.in',
    action: 'product.price_update',
    resource: 'products',
    resourceId: 'prod-heavy-tee',
    details: 'Base price updated from ₹999 to ₹1,199',
    ipAddress: '103.24.12.89',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log-102',
    adminEmail: 'siddharth@bingooo.in',
    action: 'order.status_update',
    resource: 'orders',
    resourceId: 'BING-89421',
    details: 'Fulfillment moved to processing with BlueDart AWB# DL109823489IN',
    ipAddress: '49.36.18.204',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'log-103',
    adminEmail: 'admin@bingooo.in',
    action: 'payment.refund_authorized',
    resource: 'payments',
    resourceId: 'pay_Nz50Po88Lk11X4',
    details: 'Refund of ₹1,899 triggered via Razorpay gateway for customer return',
    ipAddress: '103.24.12.89',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'log-104',
    adminEmail: 'ananya.d@bingooo.in',
    action: 'inventory.stock_adjust',
    resource: 'inventory',
    resourceId: 'BING-TEE-BLK-L',
    details: 'Manual physical inventory count adjustment (+25 units)',
    ipAddress: '157.49.201.12',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'log-105',
    adminEmail: 'admin@bingooo.in',
    action: 'customization.artwork_approved',
    resource: 'custom_designs',
    resourceId: 'des-tokyo-cyber',
    details: 'Customer studio backprint vector approved for DTG queue',
    ipAddress: '103.24.12.89',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export function AuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const matchesAction =
      actionFilter === 'all' || log.action.startsWith(actionFilter);
    const matchesSearch =
      log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <History size={14} /> Compliance & Security
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Immutable Audit Trail & Operations Log
          </h2>
          <p className="text-xs text-muted">
            Cryptographically verifiable administrative activity log for pricing modifications, stock adjustments, and refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-admin w-auto text-xs font-bold"
          >
            <option value="all">All Operations</option>
            <option value="product">Products</option>
            <option value="order">Orders</option>
            <option value="payment">Finance & Refunds</option>
            <option value="inventory">Inventory</option>
            <option value="customization">Custom Studio</option>
          </select>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card-admin p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by administrator email, resource ID, or operation description..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card-admin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Administrator</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Audit Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#FDF9F4]">
                  <td className="p-4">
                    <span className="font-bold text-ink">{log.adminEmail}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block rounded-md bg-[#EDE0CC] px-2 py-0.5 font-mono text-[11px] font-bold text-ink">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-muted">
                      {log.resource}/{log.resourceId}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-ink text-xs line-clamp-2">{log.details}</p>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-muted">{log.ipAddress}</td>
                  <td className="p-4 text-muted whitespace-nowrap">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
