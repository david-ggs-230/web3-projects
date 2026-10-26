// Src/utils/refreshStrore.ts
import { create } from "zustand";

export interface RefreshStoreState {
  refresh: boolean;
  setRefresh: () => void;
}

export const useRefreshStore = create<RefreshStoreState>((set) => ({
  refresh: false,
  setRefresh: () => {
    set((prev) => ({ refresh: !prev.refresh }));
  },
}));
