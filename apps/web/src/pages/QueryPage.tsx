import { useRef, useState } from 'react'
import { api } from '../api/client'
import { useConnectionStore } from '../store/connection.store'
import { IdeLayout } from '../layout/IdeLayout'
import { Sidebar } from '../components/Sidebar'
import { ResultTable } from '../components/ResultTable'
import { SqlEditor } from '../components/SqlEditor'
import { useSqlStore } from '../store/sql.store'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function QueryPage() {
    const connectionId = useConnectionStore((s) => s.connectionId)

    const sql = useSqlStore((s) => s.sql)
    const setSql = useSqlStore((s) => s.setSql)
    const appendSql = useSqlStore((s) => s.appendSql)
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

    const quoteIdent = (value: string) => `"${value.replaceAll('"', '""')}"`
    const tableRef = (schema: string, table: string) =>
        `${quoteIdent(schema)}.${quoteIdent(table)}`
    const columnRef = (schema: string, table: string, column: string) =>
        `${quoteIdent(schema)}.${quoteIdent(table)}.${quoteIdent(column)}`

    const [result, setResult] = useState<any>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [activeQueryId, setActiveQueryId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const runTokenRef = useRef<number>(0)
    const abortRef = useRef<AbortController | null>(null)
    const [safeMode, setSafeMode] = useState(true)

    const MAX_ROW_LIMIT = 5000
    const MAX_TIMEOUT_MS = 60 * 1000 // hard cap (1 min)
    const MIN_TIMEOUT_MS = 2 * 1000  // avoid tiny values that cause confusion

    const [rowLimit, setRowLimit] = useState<number>(1000)
    const [timeoutMs, setTimeoutMs] = useState<number>(60 * 1000)

    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

    const effectiveRowLimit = clamp(Number.isFinite(rowLimit) ? rowLimit : 1000, 1, MAX_ROW_LIMIT)
    const effectiveTimeoutMs = clamp(Number.isFinite(timeoutMs) ? timeoutMs : 60 * 1000, MIN_TIMEOUT_MS, MAX_TIMEOUT_MS)

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
        setError(null)
        setResult(null)

        try {
            const res = await api.post(
                `/connections/${connectionId}/query`,
                {
                    sql,
                    timeoutMs: effectiveTimeoutMs,
                    rowLimit: effectiveRowLimit,
                    safeMode,
                },
                { signal: controller.signal },
            )

            // Ignore late responses from older runs
            if (runTokenRef.current !== token) return

            setResult(res.data)
            setActiveQueryId(res.data.queryId ?? null)
        } catch (err: any) {
            // If user cancelled the request, just exit quietly
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return

            const status = err?.response?.status
            const message =
                err?.response?.data?.message ??
                err?.message ??
                'Query failed'

            setError(status ? `[${status}] ${message}` : String(message))
            setResult(null)
            setActiveQueryId(null)
            return
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
        setActiveQueryId(null)
        setError('Query cancelled')

        // 2) If we have a server-side queryId, request DB cancellation too
        if (!connectionId || !activeQueryId) return
        try {
            await api.post(`/connections/${connectionId}/query/${activeQueryId}/cancel`)
        } catch {
            // ignore
        }
    }

    const copyQueryId = async () => {
        const id = activeQueryId ?? result?.queryId
        if (!id) return
        try {
            await navigator.clipboard.writeText(String(id))
            setCopied(true)
            setTimeout(() => setCopied(false), 900)
        } catch {
            // ignore (clipboard may be unavailable depending on browser permissions)
        }
    }

    const clearOutput = () => {
        setResult(null)
        setError(null)
        setActiveQueryId(null)
    }

    return (
        <IdeLayout
            sidebar={
                <Sidebar
                    onSelectTable={(schema, table) => {
                        setSql(
                            `SELECT * FROM ${tableRef(schema, table)} LIMIT ${effectiveRowLimit};`,
                        )
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
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={!isAuthenticated}
                                    onClick={() => setSafeMode((v) => !v)}
                                    className={[
                                        'h-8 px-3 rounded border text-xs flex items-center gap-2',
                                        safeMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-900',
                                        !isAuthenticated ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90',
                                    ].join(' ')}
                                    title={
                                        !isAuthenticated
                                            ? 'Safe Mode is locked for guests. Login to disable.'
                                            : safeMode
                                                ? 'Safe Mode ON (read-only)'
                                                : 'Safe Mode OFF (write enabled)'
                                    }
                                >
                                    <span className="inline-flex w-4 justify-center">
                                        {!isAuthenticated ? '🔒' : safeMode ? '🛡️' : '⚠️'}
                                    </span>
                                    <span>Safe Mode</span>
                                    <span className="opacity-80">{safeMode ? 'ON' : 'OFF'}</span>
                                </button>

                                {!isAuthenticated ? (
                                    <div className="text-[11px] text-neutral-500">
                                        Locked for guests.{' '}
                                        <Link className="text-neutral-200 underline" to="/login">
                                            Login
                                        </Link>{' '}
                                        to disable.
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-2 py-1">
                                    <label className="text-[11px] text-neutral-400" title={`Max ${MAX_ROW_LIMIT}`}>
                                        Rows
                                    </label>
                                    <input
                                        inputMode="numeric"
                                        className="w-20 bg-transparent text-xs text-neutral-100 outline-none"
                                        value={String(rowLimit)}
                                        onChange={(e) => {
                                            const v = e.target.value.trim()
                                            if (v === '') return setRowLimit(0)
                                            const n = Number(v)
                                            if (!Number.isFinite(n)) return
                                            setRowLimit(Math.floor(n))
                                        }}
                                        onBlur={() => {
                                            setRowLimit(effectiveRowLimit)
                                        }}
                                        placeholder="1000"
                                        title={`Row limit (1–${MAX_ROW_LIMIT})`}
                                    />
                                    <span className="text-[11px] text-neutral-500">/ {MAX_ROW_LIMIT}</span>
                                </div>

                                <div className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-2 py-1">
                                    <label className="text-[11px] text-neutral-400" title={`Max ${Math.round(MAX_TIMEOUT_MS / 1000)}s`}>
                                        Timeout
                                    </label>
                                    <select
                                        className="bg-transparent text-xs text-neutral-100 outline-none"
                                        value={String(timeoutMs)}
                                        onChange={(e) => {
                                            const n = Number(e.target.value)
                                            if (Number.isFinite(n)) setTimeoutMs(n)
                                        }}
                                        title={`Timeout (min ${Math.round(MIN_TIMEOUT_MS / 1000)}s, max ${Math.round(MAX_TIMEOUT_MS / 1000)}s)`}
                                    >
                                        <option value={String(5 * 1000)}>5s</option>
                                        <option value={String(15 * 1000)}>15s</option>
                                        <option value={String(30 * 1000)}>30s</option>
                                        <option value={String(60 * 1000)}>60s</option>
                                    </select>
                                </div>
                            </div>

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
                <div className="p-4 flex-1 min-h-0 overflow-auto space-y-3">
                    {/* Results header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            {isRunning ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                    Running…
                                </span>
                            ) : error ? (
                                <span className="inline-flex items-center gap-2 text-red-200">
                                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                                    Failed
                                </span>
                            ) : result ? (
                                <>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                        Success
                                    </span>

                                    {typeof result?.rowCount === 'number' ? (
                                        <span className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5">
                                            {result.rowCount} rows
                                        </span>
                                    ) : null}

                                    {typeof result?.executionTimeMs === 'number' ? (
                                        <span className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5">
                                            {result.executionTimeMs} ms
                                        </span>
                                    ) : null}

                                    <span className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5">
                                        limit {effectiveRowLimit}
                                    </span>
                                    <span className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5">
                                        timeout {Math.round(effectiveTimeoutMs / 1000)}s
                                    </span>
                                </>
                            ) : (
                                <span className="text-neutral-500">No results</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {(activeQueryId || result?.queryId) ? (
                                <>
                                    <span
                                        className="text-xs rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-300 max-w-[220px] truncate"
                                        title={String(activeQueryId ?? result?.queryId)}
                                    >
                                        id: {String(activeQueryId ?? result?.queryId)}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={copyQueryId}
                                        className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1"
                                        title="Copy query id"
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </>
                            ) : null}

                            <button
                                type="button"
                                onClick={clearOutput}
                                disabled={isRunning || (!result && !error)}
                                className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 px-3 py-1"
                                title="Clear results and errors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Results body */}
                    {error ? (
                        <div className="rounded border border-red-900/60 bg-red-950/40 p-4">
                            <div className="text-sm font-medium text-red-200">
                                Query Error
                            </div>
                            <div className="mt-2 text-sm text-red-100 whitespace-pre-wrap">
                                {error}
                            </div>
                        </div>
                    ) : result ? (
                        <ResultTable data={result} />
                    ) : (
                        <div className="text-sm text-neutral-500">
                            Run a query to see results.
                        </div>
                    )}
                </div>
            }
        />
    )
}