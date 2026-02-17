import { useEffect, useMemo, useState } from 'react'
import { useConnectionStore } from '../store/connection.store'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { openConnectionFromLocal, openConnectionFromProfile } from '../api/connections'
import {
  createProfileConnection,
  deleteProfileConnection,
  getProfileConnections,
} from '../api/profileConnections'

export function ConnectionPage() {
  const setConnectionId = useConnectionStore((s) => s.setConnectionId)
  const setConnectionMeta = useConnectionStore((s) => s.setConnectionMeta)
  const navigate = useNavigate()
  const connectionId = useConnectionStore((s) => s.connectionId)
  const saved = useConnectionStore((s) => s.saved)
  const hydrateSaved = useConnectionStore((s) => s.hydrateSaved)
  const addOrUpdateSaved = useConnectionStore((s) => s.addOrUpdateSaved)
  const removeSaved = useConnectionStore((s) => s.removeSaved)
  const renameSaved = useConnectionStore((s) => s.renameSaved)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const profileConnections = useConnectionStore((s) => s.profileConnections)
  const setProfileConnections = useConnectionStore((s) => s.setProfileConnections)
  const renameProfileConnectionLocal = useConnectionStore((s) => s.renameProfileConnectionLocal)
  const removeProfileConnectionLocal = useConnectionStore((s) => s.removeProfileConnectionLocal)
  const touchProfileConnectionLocal = useConnectionStore((s) => s.touchProfileConnectionLocal)

  const [form, setForm] = useState({
    name: '',
    host: 'db',
    port: 5432,
    database: 'tabblelab',
    user: 'postgres',
    password: 'postgres',
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveAlias = useMemo(() => {
    const a = form.name.trim()
    if (a) return a
    const db = form.database.trim()
    if (db) return db
    return `postgres@${form.host}:${form.port}`
  }, [form.name, form.database, form.host, form.port])

  useEffect(() => {
    if (connectionId) navigate('/query', { replace: true })
  }, [connectionId, navigate])

  useEffect(() => {
    if (!isAuthenticated) {
      hydrateSaved()
      return
    }

    let cancelled = false
    getProfileConnections()
      .then((rows) => {
        if (cancelled) return
        setProfileConnections(
          rows.map((r: any) => ({
            id: String(r.id),
            driver: 'postgres',
            name: String(r.name ?? ''),
            host: String(r.host ?? ''),
            port: Number(r.port ?? 0),
            database: String(r.database ?? ''),
            user: String(r.user ?? ''),
            createdAt: r.createdAt ? String(r.createdAt) : undefined,
            lastUsedAt: r.lastUsedAt ? String(r.lastUsedAt) : undefined,
          })),
        )
      })
      .catch(() => {
        // ignore, page can still be used
      })

    return () => {
      cancelled = true
    }
  }, [hydrateSaved, isAuthenticated, setProfileConnections])

  const handleConnect = async () => {
    if (isConnecting) return

    setError(null)

    // Basic validation
    if (!form.host.trim()) return setError('Host is required.')
    if (!form.database.trim()) return setError('Database is required.')
    if (!form.user.trim()) return setError('User is required.')
    if (!form.password) return setError('Password is required.')
    if (!Number.isFinite(Number(form.port)) || Number(form.port) <= 0) {
      return setError('Port must be a valid number.')
    }

    setIsConnecting(true)
    try {
      let connectionIdRes: { connectionId: string }

      if (isAuthenticated) {
        const profile = await createProfileConnection({
          driver: 'postgres',
          name: effectiveAlias,
          host: form.host.trim(),
          port: Number(form.port),
          database: form.database.trim(),
          user: form.user.trim(),
          password: form.password,
        })

        connectionIdRes = await openConnectionFromProfile(profile.id)

        touchProfileConnectionLocal(profile.id)
        getProfileConnections()
          .then((rows) => {
            setProfileConnections(
              rows.map((r: any) => ({
                id: String(r.id),
                driver: 'postgres',
                name: String(r.name ?? ''),
                host: String(r.host ?? ''),
                port: Number(r.port ?? 0),
                database: String(r.database ?? ''),
                user: String(r.user ?? ''),
                createdAt: r.createdAt ? String(r.createdAt) : undefined,
                lastUsedAt: r.lastUsedAt ? String(r.lastUsedAt) : undefined,
              })),
            )
          })
          .catch(() => { })
      } else {
        connectionIdRes = await openConnectionFromLocal({
          driver: 'postgres',
          host: form.host.trim(),
          port: Number(form.port),
          database: form.database.trim(),
          user: form.user.trim(),
          password: form.password,
        })

        addOrUpdateSaved({
          driver: 'postgres',
          name: effectiveAlias,
          host: form.host.trim(),
          port: Number(form.port),
          database: form.database.trim(),
          user: form.user.trim(),
        })
      }

      setConnectionId(connectionIdRes.connectionId)
      setConnectionMeta({ driver: 'postgres', name: effectiveAlias })
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to create connection.'
      setError(String(message))
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-neutral-100">
              Connect to PostgreSQL
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Create a connection for this session. For guests, credentials are not saved.
            </p>
          </div>

          <span className="text-xs rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-300">
            Local Dev
          </span>
        </div>

        {error ? (
          <div className="mt-4 rounded border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-100 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        {(isAuthenticated ? profileConnections.length : saved.length) > 0 ? (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-neutral-200">Saved connections</div>
              <div className="text-xs text-neutral-500">
                {isAuthenticated ? 'Saved to your account (no passwords shown)' : 'Saved locally (no passwords)'}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {(isAuthenticated ? profileConnections : saved).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-100 truncate" title={p.name}>
                      {p.name}
                    </div>
                    <div className="text-xs text-neutral-500 truncate">
                      postgres • {p.host}:{p.port} • {p.database} • {p.user}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          name: p.name,
                          host: p.host,
                          port: p.port,
                          database: p.database,
                          user: p.user,
                          password: '',
                        }))
                      }}
                      title="Load into form"
                    >
                      Load
                    </button>

                    <button
                      type="button"
                      className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1"
                      onClick={async () => {
                        const newAlias = prompt('New alias', p.name)
                        if (!newAlias || !newAlias.trim()) return
                        const name = newAlias.trim()

                        if (!isAuthenticated) {
                          renameSaved(p.id, name)
                          return
                        }

                        try {
                          await createProfileConnection({
                            id: p.id,
                            driver: 'postgres',
                            name,
                            host: p.host,
                            port: Number(p.port),
                            database: p.database,
                            user: p.user,
                          } as any)

                          renameProfileConnectionLocal(p.id, name)
                        } catch (err: any) {
                          const message =
                            err?.response?.data?.message ??
                            err?.message ??
                            'Failed to rename connection.'
                          setError(String(message))
                        }
                      }}
                      title="Rename"
                    >
                      Rename
                    </button>

                    <button
                      type="button"
                      className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1 text-red-200"
                      onClick={async () => {
                        if (!confirm(`Delete saved connection "${p.name}"?`)) return

                        if (!isAuthenticated) {
                          removeSaved(p.id)
                          return
                        }

                        try {
                          await deleteProfileConnection(p.id)
                          removeProfileConnectionLocal(p.id)
                        } catch (err: any) {
                          const message =
                            err?.response?.data?.message ??
                            err?.message ??
                            'Failed to delete connection.'
                          setError(String(message))
                        }
                      }}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleConnect()
          }}
        >
          <div>
            <label className="text-xs text-neutral-400">Alias (optional)</label>
            <input
              className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
              placeholder="e.g. My Local DB"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="mt-1 text-[11px] text-neutral-500">
              If empty, we’ll use: <span className="text-neutral-300">{form.database.trim()}</span>
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

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full rounded bg-neutral-100 text-neutral-900 py-2 text-sm font-medium hover:bg-white disabled:opacity-50"
          >
            {isConnecting ? 'Connecting…' : 'Connect'}
          </button>

          <div className="text-[11px] text-neutral-500">
            Tip: when using Docker Compose, set Host to <span className="text-neutral-300">db</span>.
          </div>
        </form>
      </div>
    </div>
  )
}