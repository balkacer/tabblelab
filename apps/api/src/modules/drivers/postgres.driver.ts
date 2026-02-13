import { Pool } from 'pg'
import {
    DatabaseDriver,
    QueryOptions,
    QueryResult,
} from '@tabblelab/database-core'
import { BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'

export class PostgresDriver implements DatabaseDriver {
    private pool!: Pool
    private activeQueries = new Map<string, { pid: number; startedAt: number }>()

    constructor(private readonly config: {
        host: string
        port: number
        database: string
        user: string
        password: string
        ssl?: boolean
    }) { }

    private normalizeSql(sql: string) {
        return sql.trim().replace(/;+\s*$/, '')
    }

    private enforceSelectOnly(sql: string) {
        const s = sql.trim().toLowerCase()
        if (!s.startsWith('select') && !s.startsWith('with')) {
            // WITH ... SELECT
            throw new BadRequestException('Only SELECT statements are allowed in safe mode')
        }
    }

    private applyRowLimit(sql: string, limit: number) {
        const clean = this.normalizeSql(sql)
        return `SELECT * FROM (${clean}) AS __tabblelab_sub LIMIT ${limit}`
    }

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
        opts?: { timeoutMs?: number; rowLimit?: number },
    ): Promise<{
        queryId: string
        columns: string[]
        rows: Record<string, any>[]
        rowCount: number
        executionTimeMs: number
    }> {
        const started = Date.now()

        // defaults/env
        const defaultTimeoutMs = Number(process.env.TABBLELAB_DEFAULT_TIMEOUT_MS ?? 8000)
        const maxRowLimit = Number(process.env.TABBLELAB_MAX_ROW_LIMIT ?? 1000)
        const safeMode = String(process.env.TABBLELAB_SAFE_MODE ?? 'true') === 'true'

        const timeoutMs = Math.max(1, opts?.timeoutMs ?? defaultTimeoutMs)
        const requestedLimit = opts?.rowLimit ?? maxRowLimit
        const rowLimit = Math.min(Math.max(1, requestedLimit), maxRowLimit)

        const cleanSql = this.normalizeSql(sql)

        if (safeMode) this.enforceSelectOnly(cleanSql)

        const limitedSql = this.applyRowLimit(cleanSql, rowLimit)

        const client = await this.pool.connect()
        const queryId = randomUUID()

        try {
            // get pid and track
            const pidRes = await client.query<{ pid: number }>('SELECT pg_backend_pid() as pid')
            const pid = pidRes.rows[0]?.pid
            if (pid) this.activeQueries.set(queryId, { pid, startedAt: started })

            await client.query('BEGIN')
            await client.query(`SET LOCAL statement_timeout = ${timeoutMs}`)
            const res = await client.query(limitedSql)
            await client.query('COMMIT')

            return {
                queryId,
                columns: res.fields.map((f) => f.name),
                rows: res.rows,
                rowCount: res.rowCount ?? res.rows.length,
                executionTimeMs: Date.now() - started,
            }
        } catch (e) {
            try {
                await client.query('ROLLBACK')
            } catch { }
            throw e
        } finally {
            this.activeQueries.delete(queryId)
            client.release()
        }
    }

    async getTables(): Promise<{ schema: string; name: string }[]> {
        const result = await this.pool.query(`
    SELECT table_schema AS schema, table_name AS name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
  `)

        return result.rows
    }

    async getColumns(
        schema: string,
        table: string,
    ): Promise<
        {
            name: string
            dataType: string
            isNullable: boolean
            isPrimaryKey: boolean
            isForeignKey: boolean
        }[]
    > {
        const result = await this.pool.query(
            `
      WITH cols AS (
        SELECT
          c.column_name AS name,
          c.data_type AS "dataType",
          (c.is_nullable = 'YES') AS "isNullable",
          c.ordinal_position
        FROM information_schema.columns c
        WHERE c.table_schema = $1 AND c.table_name = $2
      ),
      pk AS (
        SELECT kcu.column_name AS name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
         AND tc.table_name = kcu.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2
      ),
      fk AS (
        SELECT kcu.column_name AS name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
         AND tc.table_name = kcu.table_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2
      )
      SELECT
        cols.name,
        cols."dataType",
        cols."isNullable",
        (pk.name IS NOT NULL) AS "isPrimaryKey",
        (fk.name IS NOT NULL) AS "isForeignKey"
      FROM cols
      LEFT JOIN pk ON pk.name = cols.name
      LEFT JOIN fk ON fk.name = cols.name
      ORDER BY cols.ordinal_position;
      `,
            [schema, table],
        )

        return result.rows
    }

    async cancelQuery(queryId: string): Promise<boolean> {
        const info = this.activeQueries.get(queryId)
        if (!info) return false

        // cancelar desde otro client
        const res = await this.pool.query('SELECT pg_cancel_backend($1) AS cancelled', [info.pid])
        return !!res.rows?.[0]?.cancelled
    }
}