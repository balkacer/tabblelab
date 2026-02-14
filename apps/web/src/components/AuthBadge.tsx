import { Link } from "react-router-dom"
import { useAuthStore } from "../store/auth.store"

export function AuthBadge() {
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)

    return (
        <div className="flex items-center gap-2 text-xs">
            {user ? (
                <>
                    <span className="rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-200 max-w-[220px] truncate" title={user.email}>
                        {user.email}
                    </span>
                    <button
                        type="button"
                        onClick={() => logout()}
                        className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 hover:bg-neutral-800 text-neutral-200"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link
                        className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 hover:bg-neutral-800 text-neutral-200"
                        to="/login"
                    >
                        Login
                    </Link>
                    <Link
                        className="rounded bg-neutral-100 text-neutral-900 px-3 py-1 font-medium"
                        to="/register"
                    >
                        Register
                    </Link>
                </>
            )}
        </div>
    )
}
