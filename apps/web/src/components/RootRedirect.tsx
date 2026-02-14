import { Navigate } from "react-router-dom"
import { useConnectionStore } from "../store/connection.store"

export function RootRedirect() {
    const connectionId = useConnectionStore((s) => s.connectionId)
    return <Navigate to={connectionId ? '/query' : '/connect'} replace />
}
