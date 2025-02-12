import { create } from 'zustand';

interface SiderState {
  isSiderVisible: boolean;
  toggleSider: () => void;
  closeSider: () => void;
}

export const useSiderStore = create<SiderState>((set) => ({
  isSiderVisible: false,
  toggleSider: () => set((state) => ({ isSiderVisible: !state.isSiderVisible })),
  closeSider: () => set({ isSiderVisible: false }),
}));
