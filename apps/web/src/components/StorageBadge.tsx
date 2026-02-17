export function StorageBadge({ isLocal }: { isLocal: boolean }) {
    return (
        <span className="ml-2 inline-flex items-center rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300">
            {isLocal ? 'Local' : 'Account'}
        </span>
    )
}