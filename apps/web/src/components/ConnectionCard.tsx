import { useAuthStore } from "../store/auth.store"
import { SavedLike } from "../types/savedLike.type"
import { StorageBadge } from "./StorageBadge"

export function ConnectionCard(props: {
    p: SavedLike
    isConnecting: boolean
    onConnect: (p: SavedLike) => Promise<void>
    onRename: (p: SavedLike) => Promise<void>
    onDelete: (p: SavedLike) => Promise<void>
}) {
    const { p, isConnecting, onConnect, onRename, onDelete } = props

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <div className="min-w-0 flex-1">
                <div className="flex items-center">
                    <div className="text-sm font-medium text-neutral-100 truncate" title={p.name}>
                        {p.name}
                    </div>
                    <StorageBadge isLocal={p.isLocal} />
                </div>
                <div className="text-xs text-neutral-500 truncate">
                    {p.driver} • {p.host}:{p.port} • {p.database} • {p.user}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1 disabled:opacity-50"
                    onClick={() => onConnect(p)}
                    title="Connect to this database"
                    disabled={isConnecting}
                >
                    Connect
                </button>

                <button
                    type="button"
                    className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1"
                    onClick={() => onRename(p)}
                    title="Rename"
                >
                    Rename
                </button>

                <button
                    type="button"
                    className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1 text-red-200"
                    onClick={() => onDelete(p)}
                    title="Delete"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}