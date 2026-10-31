import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Users as UsersIcon, RefreshCw } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#171717] text-white px-2 py-0.5">
              CLIENT DIRECTORY
            </span>
            <span className="text-[#171717]/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717]/70">
              {customers.length} REGISTERED PATRONS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171717] font-sans mt-1">
            Customers & Members
          </h1>
          <p className="text-xs text-[#171717]/70 mt-0.5 font-medium">
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

      {/* Bauhaus Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/60" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9 py-1.5 text-xs font-mono font-semibold"
          />
        </form>

        <div className="text-[11px] font-mono font-bold text-[#171717] uppercase bg-[#F7EEDB] border border-[#171717] px-2.5 py-1 shadow-[1px_1px_0px_#171717]">
          Showing {customers.length} patrons
        </div>
      </div>

      {/* Bauhaus Customers Table */}
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
                  <td colSpan={6} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={22} className="animate-spin text-[#E6321C]" />
                      <span className="font-mono text-xs uppercase tracking-widest font-bold">
                        Loading Client Records…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UsersIcon size={32} className="text-[#171717]/40" />
                      <span className="font-bold text-[#171717] text-sm uppercase font-mono">No customers found</span>
                      <p className="text-xs text-[#171717]/70 max-w-sm">
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
                    <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 border-2 border-[#171717] flex items-center justify-center font-black text-xs font-mono shadow-[2px_2px_0px_#171717] ${
                              isAdmin
                                ? 'bg-[#E6321C] text-white'
                                : 'bg-[#171717] text-white'
                            }`}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-[#171717] leading-tight">
                              {c.full_name || 'Guest Patron'}
                            </p>
                            <p className="text-[10px] text-[#171717]/60 font-mono font-semibold">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-xs font-mono font-semibold text-[#171717]">
                          {c.phone || '—'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717] ${
                            isAdmin ? 'bg-[#E6321C] text-white' : 'bg-[#F7EEDB] text-[#171717]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 ${isAdmin ? 'bg-white' : 'bg-[#171717]'}`} />
                          {c.role?.replace(/_/g, ' ') || 'CUSTOMER'}
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-bold text-[#171717]">
                          {c.order_count ?? 0} orders
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-black text-[#171717]">
                          {c.total_spent != null
                            ? '₹' + Number(c.total_spent).toLocaleString('en-IN')
                            : '—'}
                        </span>
                      </td>

                      <td className="text-[11px] text-[#171717]/70 whitespace-nowrap font-mono font-semibold">
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
