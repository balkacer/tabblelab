import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConnectionStore } from '../store/connection.store'
import { fetchTables, fetchColumns } from '../api/schema'

type TableRef = { schema: string; name: string }

function Chevron({ open }: { open: boolean }) {
  return (
    <span className="inline-block w-4 text-neutral-500 select-none">
      {open ? '▾' : '▸'}
    </span>
  )
}

function NodeButton({
  open,
  label,
  onClick,
  indent = 0,
  kind,
  title,
}: {
  open?: boolean
  label: React.ReactNode
  onClick?: () => void
  indent?: number
  kind: 'connection' | 'schema' | 'table' | 'column'
  title?: string
}) {
  const padding = 8 + indent * 14

  const icon =
    kind === 'connection'
      ? '🧪'
      : kind === 'schema'
        ? '🗂️'
        : kind === 'table'
          ? '📄'
          : '🔹'

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-full text-left hover:bg-neutral-800/60 rounded px-2 py-1 flex items-center gap-1"
      style={{ paddingLeft: padding }}
    >
      {open !== undefined ? <Chevron open={open} /> : <span className="w-4" />}
      <span className="w-5">{icon}</span>
      <span className="text-sm text-neutral-200 truncate">{label}</span>
    </button>
  )
}

export function Sidebar() {
  const connectionId = useConnectionStore((s) => s.connectionId)
  const clearConnection = useConnectionStore((s) => s.clearConnection)

  // Tree state
  const [openConnection, setOpenConnection] = useState(true)
  const [openSchemas, setOpenSchemas] = useState<Record<string, boolean>>({})
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({}) // key: schema.table

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables', connectionId],
    queryFn: () => fetchTables(connectionId!),
    enabled: !!connectionId,
  })

  const schemas = useMemo(() => {
    const map = new Map<string, TableRef[]>()
    for (const t of tables) {
      if (!map.has(t.schema)) map.set(t.schema, [])
      map.get(t.schema)!.push(t)
    }
    // sort schemas + tables
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([schema, schemaTables]) => ({
        schema,
        tables: schemaTables.sort((x, y) => x.name.localeCompare(y.name)),
      }))
  }, [tables])

  // Helper to build key
  const tableKey = (schema: string, table: string) => `${schema}.${table}`

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-neutral-500 uppercase tracking-wide">
          Explorer
        </div>
        <button
          onClick={clearConnection}
          className="text-xs text-red-400 hover:underline"
        >
          Disconnect
        </button>
      </div>

      {/* Connection root */}
      <NodeButton
        kind="connection"
        open={openConnection}
        label={
          <span className="text-neutral-200">
            TabbleLab <span className="text-neutral-500">(active)</span>
          </span>
        }
        onClick={() => setOpenConnection((v) => !v)}
        title={connectionId ?? undefined}
      />

      {!openConnection ? null : (
        <div className="space-y-1">
          {isLoading && (
            <div className="px-3 py-2 text-xs text-neutral-400">
              Loading schema…
            </div>
          )}

          {!isLoading && schemas.length === 0 && (
            <div className="px-3 py-2 text-xs text-neutral-400">
              No tables found
            </div>
          )}

          {/* Schemas */}
          {schemas.map(({ schema, tables }) => {
            const schemaOpen = !!openSchemas[schema]
            return (
              <div key={schema} className="space-y-1">
                <NodeButton
                  kind="schema"
                  open={schemaOpen}
                  indent={1}
                  label={schema}
                  onClick={() =>
                    setOpenSchemas((prev) => ({ ...prev, [schema]: !schemaOpen }))
                  }
                />

                {/* Tables */}
                {schemaOpen ? (
                  <div className="space-y-1">
                    {tables.map((t) => {
                      const key = tableKey(t.schema, t.name)
                      const tableOpen = !!openTables[key]

                      return (
                        <TableNode
                          key={key}
                          connectionId={connectionId!}
                          schema={t.schema}
                          table={t.name}
                          open={tableOpen}
                          indent={2}
                          onToggle={() =>
                            setOpenTables((prev) => ({ ...prev, [key]: !tableOpen }))
                          }
                        />
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TableNode({
  connectionId,
  schema,
  table,
  open,
  indent,
  onToggle,
}: {
  connectionId: string
  schema: string
  table: string
  open: boolean
  indent: number
  onToggle: () => void
}) {
  const { data: columns = [], isFetching } = useQuery({
    queryKey: ['columns', connectionId, schema, table],
    queryFn: () => fetchColumns(connectionId, schema, table),
    enabled: open, // fetch only when expanded
    staleTime: 60_000,
  })

  return (
    <div className="space-y-1">
      <NodeButton
        kind="table"
        open={open}
        indent={indent}
        label={table}
        onClick={onToggle}
        title={`${schema}.${table}`}
      />

      {open ? (
        <div className="space-y-1">
          {isFetching && (
            <div
              className="text-xs text-neutral-500 px-2 py-1"
              style={{ paddingLeft: 8 + (indent + 1) * 14 }}
            >
              Loading columns…
            </div>
          )}

          {columns.map((c) => {
            const type = c.dataType.toLowerCase()

            const typeIcon =
              type.includes('int') || type.includes('numeric') || type.includes('decimal')
                ? '🔢'
                : type.includes('char') || type.includes('text')
                  ? '🔤'
                  : type.includes('bool')
                    ? '🔘'
                    : type.includes('date') || type.includes('time')
                      ? '📅'
                      : type.includes('json')
                        ? '🧩'
                        : '▫️'

            return (
              <NodeButton
                key={c.name}
                kind="column"
                indent={indent + 1}
                label={
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{c.name}</span>

                    <span className="ml-auto flex items-center gap-1 text-neutral-500">
                      {/* data type icon */}
                      <span
                        title={c.dataType}
                        className="inline-flex w-5 justify-center"
                      >
                        {typeIcon}
                      </span>

                      {/* not null */}
                      {!c.isNullable ? (
                        <span
                          title="NOT NULL"
                          className="inline-flex w-5 justify-center"
                        >
                          🔒
                        </span>
                      ) : null}

                      {/* primary key */}
                      {c.isPrimaryKey ? (
                        <span
                          title="PRIMARY KEY"
                          className="inline-flex w-5 justify-center"
                        >
                          🔑
                        </span>
                      ) : null}

                      {/* foreign key */}
                      {c.isForeignKey ? (
                        <span
                          title="FOREIGN KEY"
                          className="inline-flex w-5 justify-center"
                        >
                          🔗
                        </span>
                      ) : null}
                    </span>
                  </span>
                }
                title={`${schema}.${table}.${c.name} • ${c.dataType}${c.isNullable ? '' : ' • NOT NULL'}${c.isPrimaryKey ? ' • PK' : ''}${c.isForeignKey ? ' • FK' : ''}`}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}