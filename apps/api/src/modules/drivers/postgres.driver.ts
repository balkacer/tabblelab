import { Pool } from 'pg'
import {
    DatabaseDriver,
    QueryOptions,
    QueryResult,
} from '@tabblelab/database-core'
import { BadRequestException } from '@nestjs/common'

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
        if (!sql.trim().toLowerCase().startsWith('select')) {
            throw new BadRequestException(
                'Only SELECT statements are allowed in safe mode',
            )
        }

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
}