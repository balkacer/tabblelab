import { useConnectionStore } from './store/connection.store'
import { ConnectionPage } from './pages/ConnectionPage'
import { QueryPage } from './pages/QueryPage'

function App() {
  const connectionId = useConnectionStore((s) => s.connectionId)

  return (
    <div className="h-screen bg-neutral-950 text-white">
      {connectionId ? <QueryPage /> : <ConnectionPage />}
    </div>
  )
}

export default App