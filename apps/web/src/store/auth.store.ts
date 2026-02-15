import { create } from 'zustand'
import { api } from '../api/client'

export type AuthUser = {
    id: string
    email: string
    created_at?: string
}

type AuthState = {
    user: AuthUser | null
    isLoading: boolean
    error: string | null
    isAuthenticated: boolean

    hydrate: () => Promise<void>
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const getErrorMessage = (err: any) =>
    err?.response?.data?.message ?? err?.message ?? 'Something went wrong'

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,

    hydrate: async () => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.get('/auth/me')
            set({ user: res.data, isLoading: false, isAuthenticated: true })
        } catch {
            set({ user: null, isLoading: false, isAuthenticated: false })
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.post('/auth/login', { email, password })
            set({ user: res.data.user, isLoading: false, isAuthenticated: true })
        } catch (err: any) {
            set({ error: getErrorMessage(err), isLoading: false, isAuthenticated: false })
            throw err
        }
    },

    register: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.post('/auth/register', { email, password })
            set({ user: res.data.user, isLoading: false, isAuthenticated: true })
        } catch (err: any) {
            set({ error: getErrorMessage(err), isLoading: false, isAuthenticated: false })
            throw err
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null })
        try {
            await api.post('/auth/logout')
        } finally {
            set({ user: null, isLoading: false, isAuthenticated: false })
        }
    },
}))