import { useState } from 'react'
import { api } from '../api/client'
import { useConnectionStore } from '../store/connection.store'

export function ConnectionPage() {
  const setConnectionId = useConnectionStore((s) => s.setConnectionId)

  const [form, setForm] = useState({
    host: 'db',
    port: 5432,
    database: 'tabblelab',
    user: 'postgres',
    password: 'postgres',
  })

  const handleConnect = async () => {
    const res = await api.post('/connections', {
      type: 'postgres',
      ...form,
    })

    setConnectionId(res.data.connectionId)
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-neutral-900 p-8 rounded-xl w-96 space-y-4">
        <h1 className="text-xl font-semibold">Connect to PostgreSQL</h1>

        <input
          className="w-full p-2 bg-neutral-800 rounded"
          placeholder="Host"
          value={form.host}
          onChange={(e) => setForm({ ...form, host: e.target.value })}
        />

        <input
          className="w-full p-2 bg-neutral-800 rounded"
          placeholder="Database"
          value={form.database}
          onChange={(e) => setForm({ ...form, database: e.target.value })}
        />

        <input
          className="w-full p-2 bg-neutral-800 rounded"
          placeholder="User"
          value={form.user}
          onChange={(e) => setForm({ ...form, user: e.target.value })}
        />

        <input
          type="password"
          className="w-full p-2 bg-neutral-800 rounded"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleConnect}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          Connect
        </button>
      </div>
    </div>
  )
}