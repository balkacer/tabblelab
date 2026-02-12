interface ResultTableProps {
  data: {
    columns: string[]
    rows: Record<string, any>[]
    rowCount: number
    executionTimeMs: number
  }
}

export function ResultTable({ data }: ResultTableProps) {
  if (!data || data.rows.length === 0) {
    return (
      <div className="bg-neutral-900 p-4 rounded">
        <p className="text-neutral-400 text-sm">
          Query executed in {data.executionTimeMs} ms — No rows returned
        </p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 rounded overflow-hidden">
      <div className="px-4 py-2 text-sm text-neutral-400 border-b border-neutral-800">
        {data.rowCount} rows — {data.executionTimeMs} ms
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-800 text-neutral-300">
            <tr>
              {data.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left font-medium border-b border-neutral-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-neutral-800/60 border-b border-neutral-800"
              >
                {data.columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-neutral-200">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}