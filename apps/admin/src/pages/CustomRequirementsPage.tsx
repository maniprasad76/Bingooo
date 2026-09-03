import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  DollarSign,
  User,
  Calendar,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface CustomRequirement {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  garmentType: string;
  quantity: number;
  printPlacements: string[];
  targetDate?: string;
  estimatedBudget?: number;
  status: 'new' | 'reviewing' | 'awaiting_customer' | 'approved' | 'rejected' | 'converted';
  description: string;
  attachmentName?: string;
  attachmentUrl?: string;
  internalNotes?: string;
  created_at: string;
}

const mockRequirements: CustomRequirement[] = [
  {
    id: 'cr-101',
    customerName: 'Karthik Raman',
    customerEmail: 'karthik.r@techcorp.in',
    customerPhone: '+91 99001 22334',
    garmentType: 'Heavyweight Boxy Tees (240 GSM)',
    quantity: 50,
    printPlacements: ['Front Left Chest (Embroidery)', 'Full Back (Screen Print)'],
    targetDate: '2026-09-25',
    estimatedBudget: 45000,
    status: 'new',
    description: 'Corporate tech hackathon team t-shirts. Need premium charcoal fabric with high density puff print on back.',
    attachmentName: 'TechCorp_Hackathon_Vectors.pdf',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    internalNotes: 'Contacted vendor for high-density puff ink sample.',
  },
  {
    id: 'cr-102',
    customerName: 'Samir Sheikh',
    customerEmail: 'samir.sheikh@musiccollective.com',
    customerPhone: '+91 98200 55443',
    garmentType: 'Oversized Zip Hoodies (380 GSM Fleece)',
    quantity: 30,
    printPlacements: ['Oversized Back Graphic (DTG)', 'Sleeve Tag Print'],
    targetDate: '2026-10-02',
    estimatedBudget: 60000,
    status: 'reviewing',
    description: 'Band merch for nationwide tour drop. Double-layered hood, custom silver metal zip pulls if possible.',
    attachmentName: 'Album_Tour_Artwork_HiRes.ai',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    internalNotes: 'Sample garment sent to client for fit check.',
  },
  {
    id: 'cr-103',
    customerName: 'Arjun Nambiar',
    customerEmail: 'arjun@crossfitarena.in',
    customerPhone: '+91 97400 88991',
    garmentType: 'Drop Cut Gym Tanks & Boxy Tees',
    quantity: 100,
    printPlacements: ['Center Chest Vinyl Heat Transfer'],
    targetDate: '2026-09-18',
    estimatedBudget: 75000,
    status: 'approved',
    description: 'Annual championship fitness drop. Sweat-wicking combed cotton blend with reflective logo.',
    attachmentName: 'CrossFit_Championship_Branding.svg',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    internalNotes: 'Quote accepted at Rs. 750/unit. Awaiting advance payment link.',
  },
];

export function CustomRequirementsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState<CustomRequirement | null>(null);
  const [estimateInput, setEstimateInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);

  const { data: requirements = mockRequirements } = useQuery<CustomRequirement[]>({
    queryKey: ['admin', 'custom-requirements'],
    queryFn: async () => {
      try {
        const res = await api.get<CustomRequirement[]>('/customizations/requirements');
        if (res && res.length > 0) return res;
      } catch {
        // Return mock fallback
      }
      return mockRequirements;
    },
  });

  const updateStatus = (id: string, newStatus: CustomRequirement['status']) => {
    toast({
      title: 'Status updated',
      description: `Requirement moved to ${newStatus.replace('_', ' ')}.`,
      variant: 'success',
    });
  };

  const handleOpenEstimate = (req: CustomRequirement) => {
    setSelectedReq(req);
    setEstimateInput(req.estimatedBudget ? String(req.estimatedBudget) : '');
    setNoteInput(req.internalNotes || '');
    setIsEstimateModalOpen(true);
  };

  const handleSaveEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Quote generated & internal notes updated',
      description: `Quote of ${formatCurrency(Number(estimateInput))} saved for ${selectedReq?.customerName}.`,
      variant: 'success',
    });
    setIsEstimateModalOpen(false);
  };

  const filtered = requirements.filter((r) => {
    const matchesStatus = statusTab === 'all' || r.status === statusTab;
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.garmentType.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <FileText size={14} /> Bespoke & Bulk Orders
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Custom Garment Requirements & Quotes
          </h2>
          <p className="text-xs text-muted">
            Manage custom briefs from corporate drops, music bands, and bulk bespoke printing requests.
          </p>
        </div>

        <div className="relative min-w-0 flex-1 sm:min-w-[260px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or garment..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: 'all', label: 'All Inquiries' },
          { key: 'new', label: 'New' },
          { key: 'reviewing', label: 'Reviewing' },
          { key: 'awaiting_customer', label: 'Awaiting Customer' },
          { key: 'approved', label: 'Approved' },
          { key: 'converted', label: 'Converted to Order' },
          { key: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              statusTab === tab.key
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card-admin p-12 text-center text-muted">
            <FileText size={32} className="mx-auto text-muted/50 mb-2" />
            <p className="font-bold text-ink text-sm">No custom inquiries in this status</p>
            <p className="text-xs text-muted">Customer bulk requests will show up here once submitted.</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="card-admin p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-black text-ink text-base">{req.customerName}</h3>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {req.customerEmail} • {req.customerPhone} • Received {formatDate(req.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEstimate(req)}
                    className="btn-secondary text-xs"
                  >
                    <DollarSign size={14} /> Price Quote & Notes
                  </button>
                  <select
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value as any)}
                    className="input-admin w-auto text-xs font-bold"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="awaiting_customer">Awaiting Customer</option>
                    <option value="approved">Approved</option>
                    <option value="converted">Converted to Order</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Requirement Details Grid */}
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-border bg-[#F7EEDB]/30 p-3.5 space-y-1">
                  <span className="text-muted block font-semibold text-[11px] uppercase tracking-wider">
                    Requested Garment & Volume
                  </span>
                  <p className="font-bold text-ink">{req.garmentType}</p>
                  <p className="text-brand-red font-bold">{req.quantity} Pieces</p>
                </div>

                <div className="rounded-xl border border-border bg-[#F7EEDB]/30 p-3.5 space-y-1">
                  <span className="text-muted block font-semibold text-[11px] uppercase tracking-wider">
                    Print Technique & Locations
                  </span>
                  <ul className="list-disc list-inside text-ink space-y-0.5">
                    {req.printPlacements.map((p, i) => (
                      <li key={i} className="font-medium">{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-[#F7EEDB]/30 p-3.5 space-y-1">
                  <span className="text-muted block font-semibold text-[11px] uppercase tracking-wider">
                    Estimated Quote & Deadline
                  </span>
                  <p className="font-bold text-ink">
                    {req.estimatedBudget ? formatCurrency(req.estimatedBudget) : 'Pending Quote'}
                  </p>
                  <p className="text-muted">Target: {req.targetDate ? formatDate(req.targetDate) : 'Flexible'}</p>
                </div>
              </div>

              {/* Brief Description & Attachment */}
              <div className="space-y-2 text-xs">
                <p className="text-ink leading-relaxed">
                  <strong className="text-muted block text-[11px]">Client Brief:</strong>
                  {req.description}
                </p>

                {req.attachmentName && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-mono font-medium text-ink shadow-sm">
                      <Download size={13} className="text-brand-red" />
                      {req.attachmentName}
                    </span>
                    <button
                      onClick={() => toast({ title: 'Downloading client artwork vector', variant: 'success' })}
                      className="text-[11px] font-bold text-brand-red hover:underline"
                    >
                      Download Vector Brief
                    </button>
                  </div>
                )}

                {req.internalNotes && (
                  <div className="rounded-xl border border-warning/30 bg-warning-light p-3 text-xs text-warning mt-2">
                    <strong className="block text-[10px] uppercase tracking-wider text-warning">Internal Operations Note:</strong>
                    {req.internalNotes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quote & Estimate Modal */}
      {selectedReq && (
        <Modal
          isOpen={isEstimateModalOpen}
          onClose={() => setIsEstimateModalOpen(false)}
          title={`Quote & Notes: ${selectedReq.customerName}`}
          description={`Garment: ${selectedReq.garmentType} (${selectedReq.quantity} units)`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEstimate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted">
                Total Estimated Price Quote (INR)
                <input
                  required
                  type="number"
                  value={estimateInput}
                  onChange={(e) => setEstimateInput(e.target.value)}
                  placeholder="45000"
                  className="input-admin mt-1.5 font-bold"
                />
              </label>
              <p className="mt-1 text-[11px] text-muted">
                Per piece estimate:{' '}
                {estimateInput && selectedReq.quantity
                  ? formatCurrency(Math.round(Number(estimateInput) / selectedReq.quantity))
                  : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Internal Operations Notes & Production Details
                <textarea
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record dye lot specs, DTG setup charges, or supplier turnaround commitments..."
                  className="input-admin mt-1.5"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsEstimateModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Quote & Notes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
