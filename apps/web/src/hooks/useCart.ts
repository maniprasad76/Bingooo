import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import { useCartStore } from '../store/cart';
import { useToast } from '../components/ui/Toast';
import { useEffect } from 'react';

export function useCart() {
  const queryClient = useQueryClient();
  const { setItemCount, openDrawer } = useCartStore();
  const { toast } = useToast();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<any>('/cart'),
  });

  // Sync item count to Zustand badge store
  useEffect(() => {
    if (cartQuery.data) {
      setItemCount(cartQuery.data.itemCount || 0);
    }
  }, [cartQuery.data, setItemCount]);

  const addItemMutation = useMutation({
    mutationFn: (data: { variantId: string; quantity: number; customizationId?: string }) =>
      api.post<any>('/cart/items', data),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      setItemCount(updatedCart.itemCount || 0);
      toast({ title: 'Added to cart', description: 'Item has been added to your shopping bag', variant: 'success' });
      openDrawer();
    },
    onError: (err: any) => {
      toast({ title: 'Could not add to cart', description: err.message || 'Something went wrong', variant: 'danger' });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch<any>(`/cart/items/${itemId}`, { quantity }),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      setItemCount(updatedCart.itemCount || 0);
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message, variant: 'danger' });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete<any>(`/cart/items/${itemId}`),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      setItemCount(updatedCart.itemCount || 0);
      toast({ title: 'Item removed', variant: 'default' });
    },
    onError: (err: any) => {
      toast({ title: 'Remove failed', description: err.message, variant: 'danger' });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => api.delete<any>('/cart'),
    onSuccess: (cleared) => {
      queryClient.setQueryData(['cart'], cleared);
      setItemCount(0);
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    addItem: (variantId: string, quantity = 1, customizationId?: string) =>
      addItemMutation.mutate({ variantId, quantity, customizationId }),
    updateQuantity: (itemId: string, quantity: number) =>
      updateItemMutation.mutate({ itemId, quantity }),
    removeItem: (itemId: string) => removeItemMutation.mutate(itemId),
    clearCart: () => clearCartMutation.mutate(),
    isAdding: addItemMutation.isPending,
  };
}
