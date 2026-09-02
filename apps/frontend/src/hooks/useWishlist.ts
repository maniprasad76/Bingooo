import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';

export function useWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<any[]>('/wishlist'),
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
  return useQuery({
    queryKey: ['wishlist-check', productId],
    queryFn: () => api.get<{ inWishlist: boolean }>(`/wishlist/check/${productId}`),
    enabled: !!productId,
  });
}
