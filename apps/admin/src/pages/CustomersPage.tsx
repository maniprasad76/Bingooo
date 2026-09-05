import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Mail, Phone, Calendar, LoaderCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';

interface CustomerRecord {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  order_count?: number;
  total_spent?: number;
  created_at: string;
}

export function CustomersPage() {
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading, isError } = useQuery<CustomerRecord[]>({
    queryKey: ['admin', 'customers'],
    queryFn: () => api.get<CustomerRecord[]>('/users'),
  });

  const filtered = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Customer Directory</h2>
          <p className="text-xs text-muted">
            All registered shoppers, guest checkout records, and customer lifetime dossiers.
          </p>
        </div>

        <div className="relative min-w-0 flex-1 sm:min-w-[260px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email or phone..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      <div className="overflow-hidden card-admin">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-xs">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted">
                    <LoaderCircle size={22} className="mx-auto animate-spin text-brand-red mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-danger">
                    Failed to load customers.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted">
                    No customers match your query.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FDF9F4] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEDB] font-bold text-ink text-xs uppercase">
                          {customer.full_name?.[0] || customer.email[0]}
                        </span>
                        <div>
                          <Link
                            to={`/customers/${customer.id}`}
                            className="font-bold text-ink text-sm hover:text-brand-red transition-colors block"
                          >
                            {customer.full_name || 'Guest Shopper'}
                          </Link>
                          <p className="text-[11px] text-muted">{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-muted">
                      <p className="font-semibold text-ink">{customer.phone || '—'}</p>
                    </td>

                    <td className="p-4 font-bold text-ink">
                      {customer.order_count ?? 1} order(s)
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-ink block">
                        {formatCurrency(customer.total_spent || 0)}
                      </span>
                      {(customer.total_spent || 0) > 3000 ? (
                        <span className="rounded-md bg-brand-red/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-red uppercase">
                          VIP Tier
                        </span>
                      ) : (customer.order_count || 1) > 1 ? (
                        <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[9px] font-bold text-success uppercase">
                          Repeat
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted">New</span>
                      )}
                    </td>

                    <td className="p-4 text-muted font-mono text-[11px]">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-ink hover:border-brand-red hover:text-brand-red transition-colors"
                      >
                        Dossier →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
