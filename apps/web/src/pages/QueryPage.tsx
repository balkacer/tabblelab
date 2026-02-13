import { useRef, useState } from 'react'
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
    const runTokenRef = useRef<number>(0)
    const abortRef = useRef<AbortController | null>(null)

    const runQuery = async () => {
        if (!connectionId) return

        const token = Date.now()
        runTokenRef.current = token

        // Abort any previous in-flight request (if any)
        abortRef.current?.abort()

        const controller = new AbortController()
        abortRef.current = controller

        setIsRunning(true)
        setActiveQueryId(null)

        try {
            const res = await api.post(
                `/connections/${connectionId}/query`,
                { sql },
                { signal: controller.signal },
            )

            // Ignore late responses from older runs
            if (runTokenRef.current !== token) return

            setResult(res.data)
            setActiveQueryId(res.data.queryId ?? null)
        } catch (err: any) {
            // If user cancelled the request, just exit quietly
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
            throw err
        } finally {
            // Only clear running state if this run is still the latest
            if (runTokenRef.current === token) {
                setIsRunning(false)
                abortRef.current = null
            }
        }
    }

    const cancelQuery = async () => {
        // 1) Abort the in-flight HTTP request (so UI unlocks immediately)
        abortRef.current?.abort()
        setIsRunning(false)

        // 2) If we have a server-side queryId, request DB cancellation too
        if (!connectionId || !activeQueryId) return
        try {
            await api.post(`/connections/${connectionId}/query/${activeQueryId}/cancel`)
        } catch {
            // ignore
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
                                disabled={!isRunning}
                                className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 px-4 py-1 rounded text-sm"
                                title={activeQueryId ? 'Cancel running query' : 'Stop the running request (queryId not available yet)'}
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