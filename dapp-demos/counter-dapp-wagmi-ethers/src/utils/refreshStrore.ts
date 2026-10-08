import { create } from "zustand";

export const useRefreshStore = create((set) => ({
    refresh: false,
    setRefresh: () => {
        set((prev: any) => ({ refresh: !prev.refresh }));
    },
}));
