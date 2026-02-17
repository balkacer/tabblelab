import { create } from 'zustand'
import { ConnectionDriver } from '../types/connectionDriver.type'

export type SavedConnectionProfile = {
    id: string // local id (NO es connectionId del backend)
    driver: ConnectionDriver
    name: string
    host: string
    port: number
    database: string
    user: string
    createdAt: string
    lastUsedAt: string
}

export type AuthConnectionProfile = {
    id: string // backend profile id
    driver: ConnectionDriver
    name: string
    host: string
    port: number
    database: string
    user: string
    createdAt?: string
    lastUsedAt?: string
}

type ConnectionState = {
    // Conexión activa (solo sesión actual)
    connectionId: string | null
    setConnectionId: (id: string | null) => void

    // Active connection metadata for UI (name/driver)
    connectionMeta: { driver: ConnectionDriver; name: string } | null
    setConnectionMeta: (meta: { driver: ConnectionDriver; name: string } | null) => void
    clearConnection: () => void

    // Perfiles guardados (guest): NO password
    saved: SavedConnectionProfile[]
    hydrateSaved: () => void
    addOrUpdateSaved: (p: {
        id?: string
        driver: ConnectionDriver
        name: string
        host: string
        port: number
        database: string
        user: string
    }) => string
    touchSaved: (id: string) => void
    renameSaved: (id: string, name: string) => void
    removeSaved: (id: string) => void
    clearSaved: () => void

    // Perfiles guardados (auth): vienen del backend (NO password). No se persisten en localStorage.
    profileConnections: AuthConnectionProfile[]
    setProfileConnections: (rows: AuthConnectionProfile[]) => void
    upsertProfileConnectionLocal: (p: {
        id?: string
        driver: ConnectionDriver
        name: string
        host: string
        port: number
        database: string
        user: string
        createdAt?: string
        lastUsedAt?: string
    }) => string
    touchProfileConnectionLocal: (id: string) => void
    renameProfileConnectionLocal: (id: string, name: string) => void
    removeProfileConnectionLocal: (id: string) => void
    clearProfileConnections: () => void
}

const STORAGE_KEY = 'tabblelab.savedConnections.v1'

function safeParse<T>(v: string | null): T | null {
    if (!v) return null
    try {
        return JSON.parse(v) as T
    } catch {
        return null
    }
}

function persist(saved: SavedConnectionProfile[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
        // ignore
    }
}

function uuid() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
    connectionId: null,
    setConnectionId: (id) => set({ connectionId: id }),

    connectionMeta: null,
    setConnectionMeta: (meta) => set({ connectionMeta: meta }),
    clearConnection: () => set({ connectionId: null, connectionMeta: null }),

    saved: [],

    profileConnections: [],

    hydrateSaved: () => {
        const data = safeParse<SavedConnectionProfile[]>(localStorage.getItem(STORAGE_KEY))
        if (Array.isArray(data)) set({ saved: data })
    },

    addOrUpdateSaved: (p) => {
        const now = new Date().toISOString()
        const existing = get().saved
        const id = p.id ?? uuid()

        const createdAt = existing.find((x) => x.id === id)?.createdAt ?? now

        const next: SavedConnectionProfile = {
            id,
            driver: p.driver,
            name: p.name,
            host: p.host,
            port: p.port,
            database: p.database,
            user: p.user,
            createdAt,
            lastUsedAt: now,
        }

        const idx = existing.findIndex((x) => x.id === id)
        const merged =
            idx >= 0
                ? [...existing.slice(0, idx), { ...existing[idx], ...next }, ...existing.slice(idx + 1)]
                : [next, ...existing]

        merged.sort((a, b) => (a.lastUsedAt < b.lastUsedAt ? 1 : -1))
        set({ saved: merged })
        persist(merged)
        return id
    },

    touchSaved: (id) => {
        const now = new Date().toISOString()
        const merged = get().saved.map((p) => (p.id === id ? { ...p, lastUsedAt: now } : p))
        merged.sort((a, b) => (a.lastUsedAt < b.lastUsedAt ? 1 : -1))
        set({ saved: merged })
        persist(merged)
    },

    renameSaved: (id, name) => {
        const merged = get().saved.map((p) => (p.id === id ? { ...p, name } : p))
        set({ saved: merged })
        persist(merged)
    },

    removeSaved: (id) => {
        const merged = get().saved.filter((p) => p.id !== id)
        set({ saved: merged })
        persist(merged)
    },

    clearSaved: () => {
        set({ saved: [] })
        persist([])
    },

    setProfileConnections: (rows) => {
        const sorted = [...rows].sort((a, b) => {
            const aKey = a.lastUsedAt ?? a.createdAt ?? ''
            const bKey = b.lastUsedAt ?? b.createdAt ?? ''
            return aKey < bKey ? 1 : -1
        })
        set({ profileConnections: sorted })
    },

    upsertProfileConnectionLocal: (p) => {
        const now = new Date().toISOString()
        const existing = get().profileConnections
        const id = p.id ?? uuid()

        const createdAt = existing.find((x) => x.id === id)?.createdAt ?? p.createdAt ?? now
        const lastUsedAt = p.lastUsedAt ?? now

        const next: AuthConnectionProfile = {
            id,
            driver: p.driver,
            name: p.name,
            host: p.host,
            port: p.port,
            database: p.database,
            user: p.user,
            createdAt,
            lastUsedAt,
        }

        const idx = existing.findIndex((x) => x.id === id)
        const merged =
            idx >= 0
                ? [...existing.slice(0, idx), { ...existing[idx], ...next }, ...existing.slice(idx + 1)]
                : [next, ...existing]

        merged.sort((a, b) => {
            const aKey = a.lastUsedAt ?? a.createdAt ?? ''
            const bKey = b.lastUsedAt ?? b.createdAt ?? ''
            return aKey < bKey ? 1 : -1
        })

        set({ profileConnections: merged })
        return id
    },

    touchProfileConnectionLocal: (id) => {
        const now = new Date().toISOString()
        const merged = get().profileConnections.map((p) =>
            p.id === id ? { ...p, lastUsedAt: now } : p,
        )
        merged.sort((a, b) => {
            const aKey = a.lastUsedAt ?? a.createdAt ?? ''
            const bKey = b.lastUsedAt ?? b.createdAt ?? ''
            return aKey < bKey ? 1 : -1
        })
        set({ profileConnections: merged })
    },

    renameProfileConnectionLocal: (id, name) => {
        const merged = get().profileConnections.map((p) => (p.id === id ? { ...p, name } : p))
        set({ profileConnections: merged })
    },

    removeProfileConnectionLocal: (id) => {
        const merged = get().profileConnections.filter((p) => p.id !== id)
        set({ profileConnections: merged })
    },

    clearProfileConnections: () => {
        set({ profileConnections: [] })
    },
}))