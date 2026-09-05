import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Palette, ArrowRight } from 'lucide-react';
import { api } from '../lib/api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

import { useAuthStore } from '../store/auth';

export function SavedDesignsPage() {
  const shouldReduceMotion = useReducedMotion();
  const { userId } = useAuthStore();
  const currentUserId = userId || 'mock-user-id';

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['user-designs', currentUserId],
    queryFn: () => api.get<any[]>(`/customizations/user/${currentUserId}`),
  });

  return (
    <div className="container-page py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-display-lg font-bold text-ink">My Custom Designs</h1>
          <p className="text-body text-muted">Review your saved print artworks & designs</p>
        </div>
        <Link to="/customize">
          <Button variant="primary">
            <Sparkles size={16} /> Create New Design
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted">Loading your designs...</div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-paper/50">
          <div className="h-16 w-16 rounded-full bg-paper flex items-center justify-center mb-4 text-muted">
            <Palette size={28} />
          </div>
          <h3 className="text-heading font-bold text-ink">No saved designs</h3>
          <p className="mt-1 text-body text-muted max-w-sm">
            You haven't created any custom apparel designs yet. Try our design studio!
          </p>
          <Link to="/customize" className="mt-6">
            <Button variant="primary">Start Designing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design: any, idx: number) => (
            <motion.div
              key={design.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, type: 'spring', stiffness: 350, damping: 25 }}
              whileHover={shouldReduceMotion ? undefined : { y: -4, boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.08)' }}
              className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4 transition-colors"
            >
              <div className="aspect-[4/5] rounded-lg bg-paper border border-border flex items-center justify-center relative overflow-hidden">
                <div className="text-center p-4">
                  <Sparkles size={28} className="text-accent mx-auto mb-2" />
                  <span className="text-caption font-bold text-ink block">
                    {design.design_json?.garmentColor || 'Custom'} Apparel
                  </span>
                  <span className="text-xs text-muted">
                    {design.design_json?.layers?.length || 0} Design Layers
                  </span>
                </div>
                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="accent" size="sm">{design.status}</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-body font-bold text-ink">{design.product?.title || 'Custom Garment'}</h3>
                <span className="text-caption text-muted block mt-0.5">
                  Created {new Date(design.created_at).toLocaleDateString()}
                </span>
              </div>

              <Link to={`/customize/${design.product?.slug || ''}`} className="block">
                <Button variant="outline" size="sm" fullWidth>
                  Open in Customizer <ArrowRight size={14} />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
