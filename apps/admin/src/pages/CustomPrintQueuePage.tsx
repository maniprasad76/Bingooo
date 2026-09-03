import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  LoaderCircle,
  Download,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';

interface CustomJob {
  id: string;
  status: string;
  preview_key?: string;
  design_json?: {
    garmentColor?: string;
    view?: 'front' | 'back';
    text?: string;
    font?: string;
    elements?: any[];
  };
  created_at: string;
  product?: {
    title: string;
    slug: string;
  };
  user?: {
    email: string;
  };
}

export function CustomPrintQueuePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState('all');

  const { data: jobs = [], isLoading, isError } = useQuery<CustomJob[]>({
    queryKey: ['admin', 'customizations'],
    queryFn: () => api.get<CustomJob[]>('/customizations'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/customizations/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({ title: 'Production decision saved', variant: 'success' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not update status', description: err.message, variant: 'danger' });
    },
  });

  const filtered = jobs.filter((job) => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Sparkles size={14} /> Customizer Studio Queue
          </span>
          <h2 className="mt-2 text-xl font-black tracking-tight text-ink sm:text-2xl">
            Customer Print Artwork Moderation
          </h2>
          <p className="text-xs text-muted">
            Inspect customer graphic placements, typography, and route approved jobs to DTG printing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-admin w-auto min-w-[170px] text-xs"
          >
            <option value="all">All Submissions ({jobs.length})</option>
            <option value="uploaded">Uploaded / New</option>
            <option value="needs_review">Needs Review</option>
            <option value="approved">Approved for Print</option>
            <option value="ready_for_print">Ready for Production</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid of Custom Jobs */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
          <LoaderCircle size={22} className="animate-spin text-brand-red" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading print jobs...</span>
        </div>
      ) : isError ? (
        <div className="card-admin p-8 text-center text-danger">
          Failed to fetch custom prints queue.
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-admin p-12 text-center text-xs text-muted">
          No custom prints currently matching this status.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="card-admin p-5 flex flex-col justify-between space-y-4 hover:shadow-card-hover transition-all"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <StatusBadge status={item.status} />
                <span className="text-[11px] font-mono text-muted">
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* Artwork Mockup Box */}
              <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-border bg-[#FDF9F4] p-3 overflow-hidden relative group">
                {item.preview_key ? (
                  <img
                    src={item.preview_key}
                    alt="Custom artwork preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center p-3">
                    <Sparkles className="mx-auto text-brand-red mb-1.5" size={26} />
                    <p className="text-xs font-bold text-ink">
                      {item.product?.title || 'Custom Menswear'}
                    </p>
                    <p className="text-[11px] text-muted">
                      {item.design_json?.garmentColor || 'Natural'} Apparel
                    </p>
                    {item.design_json?.text && (
                      <p className="mt-2 rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-bold text-brand-red shadow-xs">
                        "{item.design_json.text}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Garment Details */}
              <div className="space-y-1.5 text-xs text-muted">
                <p>
                  <strong className="text-ink">Garment:</strong> {item.product?.title || 'Standard Tee'}
                </p>
                <p>
                  <strong className="text-ink">Color:</strong> {item.design_json?.garmentColor || 'Black'} •{' '}
                  <strong className="text-ink">View:</strong> {(item.design_json?.view || 'front').toUpperCase()}
                </p>
                {item.design_json?.text && (
                  <p>
                    <strong className="text-ink">Custom Text:</strong> "{item.design_json.text}" (
                    {item.design_json.font || 'Default Font'})
                  </p>
                )}
              </div>

              {/* Decision Selector */}
              <div className="border-t border-border pt-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Production Approval Decision:
                  <select
                    value={item.status}
                    disabled={statusMutation.isPending}
                    onChange={(e) =>
                      statusMutation.mutate({
                        id: item.id,
                        status: e.target.value,
                      })
                    }
                    className="input-admin mt-1.5 font-bold"
                  >
                    <option value="uploaded">Uploaded (New)</option>
                    <option value="needs_review">Under Design Review</option>
                    <option value="approved">Approved for Print</option>
                    <option value="ready_for_print">Ready for Production</option>
                    <option value="rejected">Rejected (Resolution/Quality)</option>
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
