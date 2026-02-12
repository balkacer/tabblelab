export interface QueryOptions {
    timeoutMs?: number
    rowLimit?: number
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
    getTables(): Promise<string[]>
}