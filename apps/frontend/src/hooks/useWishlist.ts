import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/auth';
import { triggerHaptic } from '../lib/native/capacitorBridge';

const GUEST_WISHLIST_KEY = 'bingooo_guest_wishlist';

function getGuestWishlist(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setGuestWishlist(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch { /* skip */ }
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return getGuestWishlist().map((id) => ({ id, productId: id }));
      }
      return api.get<any[]>('/wishlist');
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async ({ productId, inWishlist }: { productId: string; inWishlist: boolean }) => {
      if (!isAuthenticated) {
        const current = getGuestWishlist();
        const next = inWishlist ? current.filter((id) => id !== productId) : [...current, productId];
        setGuestWishlist(next);
        return next.map((id) => ({ id, productId: id }));
      }

      if (inWishlist) {
        return api.delete<any[]>(`/wishlist/${productId}`);
      } else {
        return api.post<any[]>('/wishlist', { productId });
      }
    },
    onMutate: async ({ productId, inWishlist }) => {
      triggerHaptic('light');
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      await queryClient.cancelQueries({ queryKey: ['wishlist-check', productId] });

      const previousWishlist = queryClient.getQueryData<any[]>(['wishlist']) || [];
      const previousCheck = queryClient.getQueryData<{ inWishlist: boolean }>(['wishlist-check', productId]);

      // Optimistically update list
      const nextWishlist = inWishlist
        ? previousWishlist.filter((item) => (item.productId || item.id) !== productId)
        : [...previousWishlist, { id: productId, productId }];

      queryClient.setQueryData(['wishlist'], nextWishlist);
      queryClient.setQueryData(['wishlist-check', productId], { inWishlist: !inWishlist });

      return { previousWishlist, previousCheck, productId, inWishlist };
    },
    onError: (err: any, _vars, context) => {
      triggerHaptic('warning');
      if (context) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
        queryClient.setQueryData(['wishlist-check', context.productId], context.previousCheck);
      }
      toast({
        title: 'Could not update wishlist',
        description: err?.message || 'Please try again',
        variant: 'danger',
      });
    },
    onSuccess: (_data, variables) => {
      toast({
        title: variables.inWishlist ? 'Removed from wishlist' : 'Saved to wishlist',
        variant: 'default',
      });
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', variables.productId] });
    },
  });

  return {
    wishlist: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    toggleWishlist: (productId: string, inWishlist: boolean) =>
      toggleWishlistMutation.mutate({ productId, inWishlist }),
    isPending: toggleWishlistMutation.isPending,
  };
}

export function useIsInWishlist(productId?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['wishlist-check', productId],
    queryFn: async () => {
      if (!productId) return { inWishlist: false };
      if (!isAuthenticated) {
        const guestList = getGuestWishlist();
        return { inWishlist: guestList.includes(productId) };
      }
      return api.get<{ inWishlist: boolean }>(`/wishlist/check/${productId}`);
    },
    enabled: !!productId,
  });
}
