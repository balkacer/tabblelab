import { useEffect } from "react"
import { useAuthStore } from "../store/auth.store"
import { Shell } from "./Shell"
import { Routes, Route, Navigate } from "react-router-dom"
import { ConnectionPage } from "../pages/ConnectionPage"
import { LoginPage } from "../pages/LoginPage"
import { QueryPage } from "../pages/QueryPage"
import { RegisterPage } from "../pages/RegisterPage"
import { RequireConnection } from "./RequireConnection"
import { RootRedirect } from "./RootRedirect"

export function AppInner() {
    const hydrate = useAuthStore((s) => s.hydrate)

    useEffect(() => {
        hydrate()
    }, [hydrate])

    return (
        <Shell>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/connect" element={<ConnectionPage />} />
                <Route
                    path="/query"
                    element={
                        <RequireConnection>
                            <QueryPage />
                        </RequireConnection>
                    }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Shell>
    )
}