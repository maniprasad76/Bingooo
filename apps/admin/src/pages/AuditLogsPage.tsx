import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Search,
  Shield,
  User,
  Clock,
  Filter,
  ArrowRight,
  Database,
  LoaderCircle,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { api } from '../lib/api/client';

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  created_at: string;
}

export function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin', 'audit', resourceFilter, search],
    queryFn: () => api.get<AuditLogEntry[]>('/audit', { resource: resourceFilter, search }),
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
            Administrative Audit & Access Logs
          </h2>
          <p className="text-xs text-muted">
            Immutable trace of all administrative alterations, status transitions, pricing edits, and refund operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs text-muted">
            <Database size={13} className="text-brand-red" />
            <span className="font-bold text-ink">{logs.length} Total Audit Records</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-admin p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by admin email, action, SKU, or entity ID..."
            className="w-full rounded-xl border border-border bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-ink focus:border-brand-red focus:outline-none"
          >
            <option value="all">All Entity Resources</option>
            <option value="products">Products & Pricing</option>
            <option value="orders">Orders & Fulfillment</option>
            <option value="payments">Payments & Gateways</option>
            <option value="inventory">Warehouse & Inventory</option>
            <option value="custom_designs">Custom Studio Artwork</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-admin overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
            <LoaderCircle size={22} className="animate-spin text-brand-red" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading system audit trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
            <Shield size={32} className="text-border mb-2" />
            <p className="text-sm font-bold text-ink">No audit logs matching query</p>
            <p className="text-xs text-muted">Try clearing the search query or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-[#F5F0EB] text-[11px] font-black uppercase text-ink">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Administrator</th>
                  <th className="px-6 py-3.5">Event Action</th>
                  <th className="px-6 py-3.5">Resource Target</th>
                  <th className="px-6 py-3.5">Details & Payload</th>
                  <th className="px-6 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-muted text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-muted" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-sans font-bold text-ink">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-brand-red" />
                        {log.adminEmail}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block rounded-md bg-[#EDE0CC] px-2 py-0.5 text-[10px] font-bold text-ink">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-ink">
                      <span className="text-muted uppercase text-[10px] block">{log.resource}</span>
                      {log.resourceId}
                    </td>
                    <td className="px-6 py-3.5 font-sans text-xs text-ink max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-3.5 text-muted text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
