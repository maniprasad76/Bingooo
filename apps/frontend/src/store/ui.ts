import { create } from 'zustand';

interface UIStore {
  mobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  searchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  toggleSearchModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileMenuOpen: false,
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  searchModalOpen: false,
  openSearchModal: () => set({ searchModalOpen: true, mobileMenuOpen: false }),
  closeSearchModal: () => set({ searchModalOpen: false }),
  toggleSearchModal: () => set((state) => ({ searchModalOpen: !state.searchModalOpen })),
}));

