import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/auth';

export function useWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<any[]>('/wishlist'),
    // Guests have no server-side wishlist — skip the request to avoid 401 noise
    enabled: isAuthenticated,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async ({ productId, inWishlist }: { productId: string; inWishlist: boolean }) => {
      if (inWishlist) {
        return api.delete<any[]>(`/wishlist/${productId}`);
      } else {
        return api.post<any[]>('/wishlist', { productId });
      }
    },
    onSuccess: (updatedList, variables) => {
      queryClient.setQueryData(['wishlist'], updatedList);
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', variables.productId] });
      toast({
        title: variables.inWishlist ? 'Removed from wishlist' : 'Saved to wishlist',
        variant: 'default',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Please sign in first',
        description: err?.status === 401 ? 'Create an account to save garments to your wishlist.' : (err?.message || 'Could not update wishlist'),
        variant: 'danger',
      });
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
    queryFn: () => api.get<{ inWishlist: boolean }>(`/wishlist/check/${productId}`),
    // Guests have no server-side wishlist — skip the request to avoid 401 noise
    enabled: !!productId && isAuthenticated,
  });
}
