import { useState } from "react"
import { ConnectionDriver } from "../types/connectionDriver.type"
import { CreateConnectionDto } from "../types/connections.type"

export function AddConnectionForm(props: {
    isConnecting: boolean
    onClose: () => void
    onSubmit: (form: CreateConnectionDto & { name: string }) => void
}) {
    const { isConnecting, onClose, onSubmit } = props
    const [form, setForm] = useState<CreateConnectionDto & { name: string }>({
        name: '',
        driver: 'postgres',
        host: '',
        port: 5432,
        database: '',
        user: '',
        password: '',
        ssl: false,
    })

    return (
        <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(form)
            }}
        >
            <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-neutral-200">Add connection</div>
                <button
                    type="button"
                    className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-2 py-0.5 text-neutral-400"
                    onClick={onClose}
                    tabIndex={-1}
                    title="Hide form"
                >
                    Close
                </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3">
                    <label className="text-xs text-neutral-400">Alias (optional)</label>
                    <input
                        className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                        placeholder="e.g. My Local DB"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <div className="mt-1 text-[11px] text-neutral-500">
                        If empty, we’ll use:{' '}
                        <span className="text-neutral-300">{form.database.trim() || 'database name'}</span>
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-neutral-400">Driver</label>
                    <select
                        className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                        value={form.driver}
                        onChange={(e) => {
                            const v = e.target.value as ConnectionDriver
                            setForm((f) => ({
                                ...f,
                                driver: v,
                                port: v === 'postgres' ? 5432 : v === 'mysql' ? 3306 : 1433,
                            }))
                        }}
                    >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql" disabled>
                            MySQL (coming soon)
                        </option>
                        <option value="mssql" disabled>
                            MSSQL (coming soon)
                        </option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className="text-xs text-neutral-400">Host</label>
                    <input
                        className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                        placeholder="db"
                        value={form.host}
                        onChange={(e) => setForm({ ...form, host: e.target.value })}
                    />
                </div>

                <div className="col-span-1">
                    <label className="text-xs text-neutral-400">Port</label>
                    <input
                        inputMode="numeric"
                        className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                        placeholder="5432"
                        value={String(form.port)}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                port: e.target.value === '' ? ('' as any) : Number(e.target.value),
                            })
                        }
                    />
                </div>
            </div>

            <div>
                <label className="text-xs text-neutral-400">Database</label>
                <input
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                    placeholder="tabblelab"
                    value={form.database}
                    onChange={(e) => setForm({ ...form, database: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-neutral-400">User</label>
                    <input
                        className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                        placeholder="postgres"
                        value={form.user}
                        onChange={(e) => setForm({ ...form, user: e.target.value })}
                    />
                </div>

                <div>
                    <label className="text-xs text-neutral-400">Password</label>
                    <input
                        type="password"
                        className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="ssl"
                    type="checkbox"
                    checked={form.ssl}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            ssl: e.target.checked,
                        })
                    }
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-neutral-100 focus:ring-neutral-700"
                />
                <label htmlFor="ssl" className="text-xs text-neutral-400">
                    Use SSL (required for most cloud databases)
                </label>
            </div>

            <button
                type="submit"
                disabled={isConnecting}
                className="w-full rounded bg-neutral-100 text-neutral-900 py-2 text-sm font-medium hover:bg-white disabled:opacity-50"
            >
                {isConnecting ? 'Connecting…' : 'Connect'}
            </button>

            <div className="text-[11px] text-neutral-500">
                Tip: when using Docker Compose, set Host to{' '}
                <span className="text-neutral-300">db</span>.
            </div>
        </form>
    )
}