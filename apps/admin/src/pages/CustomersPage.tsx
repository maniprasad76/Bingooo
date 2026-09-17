import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Users as UsersIcon, RefreshCw, UserCheck, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = (q?: string) => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (q) params.search = q;
    api
      .get<Customer[]>('/users', params)
      .then(setCustomers)
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              CLIENT DIRECTORY
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {customers.length} REGISTERED PATRONS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Customers & Members
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Inspect customer profiles, order history, lifetime value, and role permissions.
          </p>
        </div>

        <button
          onClick={() => fetchCustomers(search)}
          className="btn-outline gap-2"
          disabled={loading}
          title="Refresh customers"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9.5 py-2 text-xs"
          />
        </form>

        <div className="text-[11px] font-mono text-muted">
          Showing {customers.length} patrons
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer / Profile</th>
                <th>Contact Info</th>
                <th>Role & Access</th>
                <th>Total Orders</th>
                <th>Lifetime Spend</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-brand-red" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Loading Client Records…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UsersIcon size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No customers found</span>
                      <p className="text-xs text-muted max-w-sm">
                        Registered shoppers and admins will appear in this directory.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const initial = (c.full_name || c.email || 'U').charAt(0).toUpperCase();
                  const isAdmin = c.role === 'SUPER_ADMIN' || c.role === 'ADMIN';

                  return (
                    <tr key={c.id} className="group">
                      <td>
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono shadow-2xs ${
                              isAdmin
                                ? 'bg-brand-red text-white'
                                : 'bg-ink text-white'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink leading-tight">
                              {c.full_name || 'Guest Patron'}
                            </p>
                            <p className="text-[10px] text-muted font-mono">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-xs font-mono text-ink">
                          {c.phone || '—'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            isAdmin ? 'badge-danger' : 'badge-neutral'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {c.role?.replace(/_/g, ' ') || 'CUSTOMER'}
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-bold text-ink">
                          {c.order_count ?? 0} orders
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-black text-ink">
                          {c.total_spent !== undefined
                            ? '₹' + c.total_spent.toLocaleString('en-IN')
                            : '—'}
                        </span>
                      </td>

                      <td className="text-[11px] text-muted whitespace-nowrap font-mono">
                        {formatDate(c.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
