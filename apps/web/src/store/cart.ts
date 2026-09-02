import { create } from 'zustand';

interface CartStore {
  /** Number of items in cart (for badge display) */
  itemCount: number;
  /** Whether the cart drawer is open */
  drawerOpen: boolean;
  setItemCount: (count: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  drawerOpen: false,
  setItemCount: (count) => set({ itemCount: count }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
}));
