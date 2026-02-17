export function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-5 flex flex-col items-center text-center">
            <div className="text-neutral-400 text-sm mb-2">No saved connections yet.</div>
            <div className="text-neutral-500 text-xs mb-4">Get started by adding a new connection.</div>
            <button
                type="button"
                className="text-xs rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1 text-neutral-200"
                onClick={onAdd}
            >
                Add connection
            </button>
        </div>
    )
}