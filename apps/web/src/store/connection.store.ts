import { create } from 'zustand'

interface ConnectionState {
    connectionId: string | null
    setConnectionId: (id: string) => void
    clearConnection: () => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
    connectionId: null,
    setConnectionId: (id) => set({ connectionId: id }),
    clearConnection: () => set({ connectionId: null }),
}))