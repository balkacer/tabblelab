import { Pool } from 'pg'
import {
    DatabaseDriver,
    QueryOptions,
    QueryResult,
} from '@tabblelab/database-core'

export class PostgresDriver implements DatabaseDriver {
    private pool!: Pool

    constructor(private readonly config: {
        host: string
        port: number
        database: string
        user: string
        password: string
        ssl?: boolean
    }) { }

    async connect(): Promise<void> {
        this.pool = new Pool({
            ...this.config,
            max: 5,
        })

        await this.pool.query('SELECT 1')
    }

    async disconnect(): Promise<void> {
        await this.pool.end()
    }

    async query(
        sql: string,
        options?: QueryOptions,
    ): Promise<QueryResult> {
        const start = Date.now()

        const rowLimit = options?.rowLimit ?? 1000
        const timeoutMs = options?.timeoutMs ?? 10000

        const client = await this.pool.connect()

        try {
            await client.query(`SET statement_timeout TO ${timeoutMs}`)

            const limitedSql = `
        SELECT * FROM (
          ${sql}
        ) as tabblelab_subquery
        LIMIT ${rowLimit}
      `

            const result = await client.query(limitedSql)

            const executionTimeMs = Date.now() - start

            return {
                columns: result.fields.map((f) => f.name),
                rows: result.rows,
                rowCount: result.rowCount ?? 0,
                executionTimeMs,
            }
        } finally {
            client.release()
        }
    }

    async getTables(): Promise<string[]> {
        const result = await this.pool.query(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `)

        return result.rows.map((r) => r.tablename)
    }
}