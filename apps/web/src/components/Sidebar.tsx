import { useConnectionStore } from '../store/connection.store'

export function Sidebar() {
  const connectionId = useConnectionStore((s) => s.connectionId)
  const clearConnection = useConnectionStore((s) => s.clearConnection)

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm text-neutral-400 uppercase tracking-wide">
        Connections
      </h2>

      {connectionId && (
        <div className="bg-neutral-800 p-3 rounded text-xs break-all">
          <p className="text-green-400 mb-2">Active</p>
          <p className="text-neutral-300">{connectionId}</p>

          <button
            onClick={clearConnection}
            className="mt-3 text-red-400 text-xs hover:underline"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}