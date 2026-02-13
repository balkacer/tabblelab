import { useState } from 'react'
import { api } from '../api/client'
import { useConnectionStore } from '../store/connection.store'
import { IdeLayout } from '../layout/IdeLayout'
import { Sidebar } from '../components/Sidebar'
import { ResultTable } from '../components/ResultTable'
import { SqlEditor } from '../components/SqlEditor'
import { useSqlStore } from '../store/sql.store'

export function QueryPage() {
    const connectionId = useConnectionStore((s) => s.connectionId)

    const sql = useSqlStore((s) => s.sql)
    const setSql = useSqlStore((s) => s.setSql)
    const appendSql = useSqlStore((s) => s.appendSql)

    const quoteIdent = (value: string) => `"${value.replaceAll('"', '""')}"`
    const tableRef = (schema: string, table: string) =>
        `${quoteIdent(schema)}.${quoteIdent(table)}`
    const columnRef = (schema: string, table: string, column: string) =>
        `${quoteIdent(schema)}.${quoteIdent(table)}.${quoteIdent(column)}`

    const [result, setResult] = useState<any>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [activeQueryId, setActiveQueryId] = useState<string | null>(null)
    const [runToken, setRunToken] = useState(0)

    const runQuery = async () => {
        const token = Date.now()
        setRunToken(token)

        setIsRunning(true)
        setActiveQueryId(null)

        try {
            const res = await api.post(`/connections/${connectionId}/query`, { sql })

            // Si se lanzó otra query o se canceló y relanzó, ignoramos este resultado
            if (runToken !== 0 && token !== runToken) return

            setResult(res.data)
            setActiveQueryId(res.data.queryId ?? null)
        } finally {
            // Solo apaga running si sigue siendo el mismo run
            if (token === runToken || runToken === 0) setIsRunning(false)
        }
    }

    const cancelQuery = async () => {
        if (!connectionId || !activeQueryId) return

        try {
            await api.post(`/connections/${connectionId}/query/${activeQueryId}/cancel`)
        } finally {
            // UI: asumimos cancel solicitado
            setIsRunning(false)
        }
    }

    return (
        <IdeLayout
            sidebar={
                <Sidebar
                    onSelectTable={(schema, table) => {
                        setSql(`SELECT * FROM ${tableRef(schema, table)} LIMIT 100`)
                    }}
                    onInsertColumn={(schema, table, column) => {
                        appendSql(columnRef(schema, table, column))
                    }}
                />
            }
            editor={
                <div className="p-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-sm text-neutral-400 uppercase">
                            Query Editor
                        </h1>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={runQuery}
                                disabled={isRunning}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-1 rounded text-sm"
                            >
                                {isRunning ? 'Running…' : 'Run'}
                            </button>

                            <button
                                onClick={cancelQuery}
                                disabled={!isRunning || !activeQueryId}
                                className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 px-4 py-1 rounded text-sm"
                                title={!activeQueryId ? 'No active queryId yet' : 'Cancel running query'}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 rounded overflow-hidden border border-neutral-800 bg-neutral-950">
                        <SqlEditor value={sql} onChange={setSql} onRun={runQuery} />
                    </div>
                </div>
            }
            results={
                <div className="p-4 flex-1 min-h-0 overflow-auto">
                    {result && <ResultTable data={result} />}
                </div>
            }
        />
    )
}