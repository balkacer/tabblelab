import { Navigate, useLocation } from "react-router-dom"
import { useConnectionStore } from "../store/connection.store"

export function RequireConnection({ children }: { children: React.ReactNode }) {
    const connectionId = useConnectionStore((s) => s.connectionId)
    const location = useLocation()
    if (!connectionId) {
        return <Navigate to="/connect" replace state={{ from: location }} />
    }
    return <>{children}</>
}