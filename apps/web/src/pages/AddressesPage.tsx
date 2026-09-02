import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export function AddressesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<any[]>('/users/addresses'),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: any) => api.post<any>('/users/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddForm(false);
      toast({ title: 'Address added', variant: 'success' });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => api.delete<any>(`/users/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: 'Address removed', variant: 'default' });
    },
  });

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addAddressMutation.mutate({
      name: fd.get('name'),
      phone: fd.get('phone'),
      line1: fd.get('line1'),
      city: fd.get('city'),
      state: fd.get('state'),
      postalCode: fd.get('postalCode'),
    });
  };

  return (
    <div className="container-page py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-display-lg font-bold text-ink">Saved Addresses</h1>
          <p className="text-body text-muted">Manage your delivery destinations</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Add New Address
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4 max-w-xl">
          <h3 className="text-heading font-bold text-ink">New Delivery Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" name="name" required defaultValue="John Doe" />
            <Input label="Phone" name="phone" required defaultValue="9876543210" />
          </div>
          <Input label="Address Line 1" name="line1" required defaultValue="100ft Road, Indiranagar" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="City" name="city" required defaultValue="Bengaluru" />
            <Input label="State" name="state" required defaultValue="Karnataka" />
            <Input label="PIN Code" name="postalCode" required defaultValue="560038" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={addAddressMutation.isPending}>
              Save Address
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-muted">Loading addresses...</div>
      ) : addresses.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-paper/50">
          <MapPin size={32} className="text-muted mb-3" />
          <h3 className="text-heading font-bold text-ink">No saved addresses</h3>
          <p className="text-body text-muted mt-1">Add an address to make checkout faster.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="rounded-xl border border-border bg-white p-6 shadow-sm flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-body font-bold text-ink">{addr.name}</span>
                  {addr.is_default && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> Default
                    </span>
                  )}
                </div>
                <p className="text-caption text-muted leading-relaxed">
                  {addr.line1}<br />
                  {addr.city}, {addr.state} - {addr.postal_code}<br />
                  Phone: {addr.phone}
                </p>
              </div>

              <button
                onClick={() => deleteAddressMutation.mutate(addr.id)}
                className="text-muted hover:text-danger p-2"
                aria-label="Delete address"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
