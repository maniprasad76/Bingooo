import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import { useCartStore } from '../store/cart';
import { useToast } from '../components/ui/Toast';
import { useEffect } from 'react';
import { triggerHaptic } from '../lib/native/capacitorBridge';

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
      triggerHaptic('medium');
      queryClient.setQueryData(['cart'], updatedCart);
      setItemCount(updatedCart.itemCount || 0);
      toast({ title: 'Added to cart', description: 'Item has been added to your shopping bag', variant: 'success' });
      openDrawer();
    },
    onError: (err: any) => {
      triggerHaptic('warning');
      toast({ title: 'Could not add to cart', description: err.message || 'Something went wrong', variant: 'danger' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch<any>(`/cart/items/${itemId}`, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      triggerHaptic('light');
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<any>(['cart']);

      if (previousCart?.items) {
        const updatedItems = previousCart.items.map((item: any) => {
          if (item.id === itemId) {
            const unitPrice = item.unitPrice ?? item.price ?? 0;
            return {
              ...item,
              quantity,
              total: unitPrice * quantity,
            };
          }
          return item;
        });

        const newSubtotal = updatedItems.reduce(
          (acc: number, i: any) => acc + (i.total ?? (i.price ?? 0) * (i.quantity ?? 1)),
          0,
        );
        const newItemCount = updatedItems.reduce(
          (acc: number, i: any) => acc + (i.quantity ?? 1),
          0,
        );

        const optimisticCart = {
          ...previousCart,
          items: updatedItems,
          subtotal: newSubtotal,
          itemCount: newItemCount,
        };

        queryClient.setQueryData(['cart'], optimisticCart);
        setItemCount(newItemCount);
      }

      return { previousCart };
    },
    onError: (err: any, _vars, context) => {
      triggerHaptic('warning');
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setItemCount(context.previousCart.itemCount || 0);
      }
      toast({ title: 'Update failed', description: err.message, variant: 'danger' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => api.delete<any>(`/cart/items/${itemId}`),
    onMutate: async (itemId) => {
      triggerHaptic('light');
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<any>(['cart']);

      if (previousCart?.items) {
        const removedItem = previousCart.items.find((i: any) => i.id === itemId);
        const updatedItems = previousCart.items.filter((i: any) => i.id !== itemId);
        const newSubtotal = updatedItems.reduce(
          (acc: number, i: any) => acc + (i.total ?? (i.price ?? 0) * (i.quantity ?? 1)),
          0,
        );
        const newItemCount = updatedItems.reduce(
          (acc: number, i: any) => acc + (i.quantity ?? 1),
          0,
        );

        const optimisticCart = {
          ...previousCart,
          items: updatedItems,
          subtotal: newSubtotal,
          itemCount: newItemCount,
        };

        queryClient.setQueryData(['cart'], optimisticCart);
        setItemCount(newItemCount);
        return { previousCart, removedItem };
      }

      return { previousCart };
    },
    onError: (err: any, _vars, context) => {
      triggerHaptic('warning');
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setItemCount(context.previousCart.itemCount || 0);
      }
      toast({ title: 'Remove failed', description: err.message, variant: 'danger' });
    },
    onSuccess: (_data, _itemId, context) => {
      const removedItem = context?.removedItem;
      toast({
        title: 'Item removed from bag',
        description: removedItem?.productTitle || removedItem?.title || 'Garment removed',
        variant: 'info',
        onUndo: removedItem
          ? () => {
              addItemMutation.mutate({
                variantId: removedItem.variantId,
                quantity: removedItem.quantity || 1,
                customizationId: removedItem.customizationId,
              });
            }
          : undefined,
        undoLabel: 'Undo',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => api.delete<any>('/cart'),
    onMutate: async () => {
      triggerHaptic('medium');
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<any>(['cart']);
      queryClient.setQueryData(['cart'], {
        ...(previousCart || {}),
        items: [],
        subtotal: 0,
        itemCount: 0,
      });
      setItemCount(0);
      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setItemCount(context.previousCart.itemCount || 0);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
