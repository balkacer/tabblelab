export interface QueryOptions {
    timeoutMs?: number
    rowLimit?: number
    safeMode?: boolean
}

export interface QueryResult {
    columns: string[]
    rows: unknown[]
    rowCount: number
    executionTimeMs: number
}

export interface DatabaseDriver {
    connect(): Promise<void>
    disconnect(): Promise<void>
    query(sql: string, options?: QueryOptions): Promise<QueryResult>
    getTables(): Promise<{ schema: string; name: string }[]>
    getColumns(schema: string, table: string): Promise<{ name: string; dataType: string; isNullable: boolean, isPrimaryKey: boolean, isForeignKey: boolean }[]>
    cancelQuery(queryId: string): Promise<boolean>
}