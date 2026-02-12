import { create } from 'zustand'

interface SqlState {
    sql: string
    setSql: (sql: string) => void
    appendSql: (snippet: string) => void
}

export const useSqlStore = create<SqlState>((set, get) => ({
    sql: 'SELECT NOW()',
    setSql: (sql) => set({ sql }),
    appendSql: (snippet) => {
        const current = get().sql ?? ''
        const needsSpace =
            current.length > 0 && !/\s$/.test(current) && snippet.length > 0 && !/^\s/.test(snippet)
        set({ sql: current + (needsSpace ? ' ' : '') + snippet })
    },
}))