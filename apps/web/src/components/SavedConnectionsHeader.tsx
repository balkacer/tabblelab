import { useState } from "react"
import { useAuthStore } from "../store/auth.store"

export function SavedConnectionsHeader(props: {
    onReload: () => Promise<void>
    openAddConnectionForm: () => void
}) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const [isReloadingProfiles, setIsReloadingProfiles] = useState(false)
    const { onReload, openAddConnectionForm } = props

    const handleReload = () => {
        setIsReloadingProfiles(true)
        onReload().finally(() => setIsReloadingProfiles(false))
    }

    return (
        <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-neutral-200">Saved connections</div>
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <button
                            type="button"
                            className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-2 py-1 text-neutral-200 disabled:opacity-50"
                            onClick={handleReload}
                            disabled={isReloadingProfiles}
                            title="Reload saved profiles"
                        >
                            {isReloadingProfiles ? 'Reloading…' : 'Reload'}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-2 py-1 text-neutral-200"
                        onClick={openAddConnectionForm}
                        title="Add a new connection"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}