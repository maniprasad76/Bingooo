import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Users as UsersIcon } from 'lucide-react';

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
    api.get<Customer[]>('/users', params)
      .then(setCustomers)
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink">Customers</h1>
          <p className="text-xs text-muted mt-0.5">{customers.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9"
          />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {/* Customers Table */}
      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <UsersIcon size={32} className="mx-auto text-muted/30 mb-2" />
                  <p className="text-sm text-muted">No customers found</p>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div>
                      <p className="text-sm font-bold text-ink">{c.full_name || '—'}</p>
                      <p className="text-[11px] text-muted">{c.email}</p>
                    </div>
                  </td>
                  <td className="text-sm">{c.phone || '—'}</td>
                  <td>
                    <span className={`badge ${c.role === 'SUPER_ADMIN' || c.role === 'ADMIN' ? 'badge-danger' : 'badge-neutral'}`}>
                      {c.role || 'customer'}
                    </span>
                  </td>
                  <td className="text-sm font-semibold">{c.order_count ?? '—'}</td>
                  <td className="text-sm font-bold">
                    {c.total_spent !== undefined ? '₹' + c.total_spent.toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="text-xs text-muted whitespace-nowrap">{formatDate(c.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
