// Src/utils/zustandStrore.ts
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

export interface OwnerStoreState {
  counterOwner: string | null;
  setCounterOwner: (owner: string | null) => void;
}

export const useOwnerStore = create((set) => ({
  counterOwner: null as string | null,
  setCounterOwner: (owner: string | null) => {
    set({ counterOwner: owner });
  },
}));
