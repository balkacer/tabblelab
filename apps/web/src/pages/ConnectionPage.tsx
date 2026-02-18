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
import { ConnectionDriver } from '../types/connectionDriver.type'
import { CreateConnectionDto } from '../types/connections.type'
import { SavedLike } from '../types/savedLike.type'
import { AddConnectionForm } from '../components/AddConnectionForm'
import { ConnectionCard } from '../components/ConnectionCard'
import { EmptyState } from '../components/EmptyState'
import { SavedConnectionsHeader } from '../components/SavedConnectionsHeader'

function mapProfileRows(rows: any[]): SavedLike[] {
  return rows.map((r: any) => ({
    id: String(r.id),
    driver: String(r.driver ?? 'postgres') as ConnectionDriver,
    name: String(r.name ?? ''),
    host: String(r.host ?? ''),
    port: Number(r.port ?? 0),
    database: String(r.database ?? ''),
    user: String(r.user ?? ''),
    isLocal: r.isLocal === true,
  }))
}

export function ConnectionPage() {
  const setConnectionId = useConnectionStore((s) => s.setConnectionId)
  const setConnectionMeta = useConnectionStore((s) => s.setConnectionMeta)
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
  const navigate = useNavigate()

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReloadingProfiles, setIsReloadingProfiles] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const effectiveSaved: SavedLike[] = useMemo(
    () => profileConnections.map((p) => ({ ...p, isLocal: false })).concat(saved.map((s) => ({ ...s, isLocal: true }))) as SavedLike[],
    [profileConnections, saved],
  )

  useEffect(() => {
    if (connectionId) navigate('/query', { replace: true })
  }, [connectionId, navigate])

  useEffect(() => {
    setShowForm(false)

    if (!isAuthenticated) {
      hydrateSaved()
      return
    }

    let cancelled = false
    getProfileConnections()
      .then((rows) => {
        if (cancelled) return
        setProfileConnections(mapProfileRows(rows))
      })
      .catch(() => {
        // ignore
      })

    return () => {
      cancelled = true
    }
  }, [hydrateSaved, isAuthenticated, setProfileConnections])

  const reloadProfiles = async () => {
    if (!isAuthenticated) return
    if (isReloadingProfiles) return

    setIsReloadingProfiles(true)

    try {
      const rows = await getProfileConnections()
      setProfileConnections(mapProfileRows(rows))
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Failed to reload saved connections.'
      setError(String(message))
    } finally {
      setIsReloadingProfiles(false)
    }
  }

  const validateForm = (form: CreateConnectionDto & { name: string }) => {
    if (!form.driver?.trim()) return 'Driver is required.'
    if (!form.host.trim()) return 'Host is required.'
    if (!form.database.trim()) return 'Database is required.'
    if (!form.user.trim()) return 'User is required.'
    if (!form.password) return 'Password is required.'
    if (!Number.isFinite(Number(form.port)) || Number(form.port) <= 0) return 'Port must be a valid number.'
    return null
  }

  const handleConnect = async (form: CreateConnectionDto & { name: string }) => {
    if (isConnecting) return

    setError(null)

    const validation = validateForm(form)

    if (validation) return setError(validation)

    setIsConnecting(true)

    try {
      const a = form.name.trim()
      const db = form.database.trim()
      const effectiveAlias = a || db || `${form.driver}@${form.host}:${form.port}`

      const effectiveConnection = {
        driver: String(form.driver) as ConnectionDriver,
        host: form.host.trim(),
        port: Number(form.port),
        database: form.database.trim(),
        user: form.user.trim(),
      }

      let connectionIdRes: { connectionId: string }

      if (isAuthenticated) {
        const profile = await createProfileConnection({
          name: effectiveAlias,
          password: form.password,
          ...effectiveConnection,
        })

        connectionIdRes = await openConnectionFromProfile(profile.id)

        touchProfileConnectionLocal(profile.id)
        getProfileConnections()
          .then((rows) => setProfileConnections(mapProfileRows(rows)))
          .catch(() => { })
      } else {
        connectionIdRes = await openConnectionFromLocal({
          password: form.password,
          ...effectiveConnection,
        })

        addOrUpdateSaved({
          name: effectiveAlias,
          ...effectiveConnection,
        })
      }

      setConnectionId(connectionIdRes.connectionId)
      setConnectionMeta({ driver: form.driver, name: effectiveAlias })
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Failed to create connection.'
      setError(String(message))
    } finally {
      setIsConnecting(false)
    }
  }

  const connectFromSaved = async (p: SavedLike) => {
    if (isConnecting) return
    setError(null)

    setIsConnecting(true)
    try {
      if (isAuthenticated && !p.isLocal) {
        const res = await openConnectionFromProfile(p.id)
        setConnectionId(res.connectionId)
        setConnectionMeta({ driver: p.driver, name: p.name })
        touchProfileConnectionLocal(p.id)
        return
      }

      const pwd = prompt(`Password for "${p.name}"`, '')
      if (!pwd) return

      const effectiveConnection = {
        driver: p.driver,
        host: p.host,
        port: Number(p.port),
        database: p.database,
        user: p.user,
      }

      const res = await openConnectionFromLocal({
        password: pwd,
        ...effectiveConnection,
      })

      addOrUpdateSaved({
        id: p.id,
        name: p.name,
        ...effectiveConnection,
      })

      setConnectionId(res.connectionId)
      setConnectionMeta({ driver: p.driver, name: p.name })
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to open connection.'
      setError(String(message))
    } finally {
      setIsConnecting(false)
    }
  }

  const renameSavedConnection = async (p: SavedLike) => {
    const newAlias = prompt('New alias', p.name)
    if (!newAlias || !newAlias.trim()) return
    const name = newAlias.trim()

    if (!isAuthenticated || p.isLocal) {
      renameSaved(p.id, name)
      return
    }

    try {
      await createProfileConnection({
        id: p.id,
        driver: p.driver,
        name,
        host: p.host,
        port: Number(p.port),
        database: p.database,
        user: p.user,
      } as any)

      renameProfileConnectionLocal(p.id, name)
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to rename connection.'
      setError(String(message))
    }
  }

  const deleteSavedConnection = async (p: SavedLike) => {
    if (!confirm(`Delete saved connection "${p.name}"?`)) return

    if (!isAuthenticated || p.isLocal) {
      removeSaved(p.id)
      return
    }

    try {
      await deleteProfileConnection(p.id)
      removeProfileConnectionLocal(p.id)
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to delete connection.'
      setError(String(message))
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-neutral-100">Connect to any database</h1>
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

        <SavedConnectionsHeader
          onReload={reloadProfiles}
          openAddConnectionForm={() => setShowForm(true)}
        />

        {effectiveSaved.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <div className="mt-3 space-y-2">
            {effectiveSaved.map((p) => (
              <ConnectionCard
                key={p.id}
                p={p}
                isConnecting={isConnecting}
                onConnect={connectFromSaved}
                onRename={renameSavedConnection}
                onDelete={deleteSavedConnection}
              />
            ))}
          </div>
        )}

        {showForm && (
          <AddConnectionForm
            isConnecting={isConnecting}
            onClose={() => setShowForm(false)}
            onSubmit={handleConnect}
          />
        )}
      </div>
    </div>
  )
}