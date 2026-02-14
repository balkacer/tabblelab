import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function RegisterPage() {
    const nav = useNavigate()
    const location = useLocation()
    const register = useAuthStore((s) => s.register)
    const isLoading = useAuthStore((s) => s.isLoading)
    const error = useAuthStore((s) => s.error)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const from = (location.state as any)?.from?.pathname ?? '/'

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await register(email, password)
        nav(from, { replace: true })
    }

    return (
        <div className="h-full flex items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <h1 className="text-lg font-semibold">Register</h1>
                <p className="text-sm text-neutral-400 mt-1">Create an account to unlock advanced features.</p>

                {error ? (
                    <div className="mt-4 rounded border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-100">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={onSubmit} className="mt-4 space-y-3">
                    <div>
                        <label className="text-xs text-neutral-400">Email</label>
                        <input
                            className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                        <div className="mt-1 text-[11px] text-neutral-500">Minimum 8 characters.</div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full rounded bg-neutral-100 text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? 'Creating…' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 text-xs text-neutral-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-neutral-200 underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    )
}