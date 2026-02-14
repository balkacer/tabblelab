import { Link } from "react-router-dom";
import { AuthBadge } from "./AuthBadge";

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-neutral-950 text-white overflow-hidden flex flex-col">
            <header className="h-12 shrink-0 border-b border-neutral-900 bg-neutral-950/60 backdrop-blur flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Link to="/" className="text-sm font-semibold text-neutral-100">
                        TabbleLab
                    </Link>
                    <span className="text-xs text-neutral-500">Local Dev</span>
                </div>
                <AuthBadge />
            </header>
            <main className="flex-1 min-h-0">{children}</main>
        </div>
    )
}