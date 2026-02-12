import { useState } from 'react'
import { api } from '../api/client'
import { useConnectionStore } from '../store/connection.store'
import { IdeLayout } from '../layout/IdeLayout'
import { Sidebar } from '../components/Sidebar'
import { ResultTable } from '../components/ResultTable'
import { SqlEditor } from '../components/SqlEditor'

export function QueryPage() {
    const connectionId = useConnectionStore((s) => s.connectionId)

    const [sql, setSql] = useState('SELECT NOW();')
    const [result, setResult] = useState<any>(null)

    const runQuery = async () => {
        const res = await api.post(`/connections/${connectionId}/query`, {
            sql,
        })

        setResult(res.data)
    }

    return (
        <IdeLayout
            sidebar={<Sidebar />}
            editor={
                <div className="p-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-sm text-neutral-400 uppercase">
                            Query Editor
                        </h1>

                        <button
                            onClick={runQuery}
                            className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm"
                        >
                            Run
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 rounded overflow-hidden border border-neutral-800 bg-neutral-950">
                        <SqlEditor value={sql} onChange={setSql} />
                    </div>
                </div>
            }
            results={
                <div className="p-4 flex-1 min-h-0 overflow-auto">
                    {result && <ResultTable data={result} />}
                </div>
            }
        />
    )
}