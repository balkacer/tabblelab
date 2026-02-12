import { useState } from 'react'
import { api } from '../api/client'
import { useConnectionStore } from '../store/connection.store'

export function QueryPage() {
  const connectionId = useConnectionStore((s) => s.connectionId)
  const clearConnection = useConnectionStore((s) => s.clearConnection)

  const [sql, setSql] = useState('SELECT NOW();')
  const [result, setResult] = useState<any>(null)

  const runQuery = async () => {
    const res = await api.post(`/connections/${connectionId}/query`, {
      sql,
    })

    setResult(res.data)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Query Editor</h1>
        <button
          onClick={clearConnection}
          className="text-sm text-red-400"
        >
          Disconnect
        </button>
      </div>

      <textarea
        className="w-full h-40 bg-neutral-900 p-4 rounded"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
      />

      <button
        onClick={runQuery}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
      >
        Run
      </button>

      {result && (
        <div className="bg-neutral-900 p-4 rounded overflow-auto">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}