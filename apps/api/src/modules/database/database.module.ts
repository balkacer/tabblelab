import { Module } from '@nestjs/common'
import { Pool } from 'pg'

@Module({
    providers: [
        {
            provide: 'INTERNAL_PG_POOL',
            useFactory: () => {
                const host = process.env.INTERNAL_DB_HOST ?? process.env.POSTGRES_HOST ?? 'db'
                const port = Number(process.env.INTERNAL_DB_PORT ?? process.env.POSTGRES_PORT ?? 5432)
                const user = process.env.INTERNAL_DB_USER ?? process.env.POSTGRES_USER ?? 'postgres'
                const password =
                    process.env.INTERNAL_DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'postgres'
                const database = process.env.INTERNAL_DB_NAME ?? process.env.POSTGRES_DB ?? 'tabblelab'

                return new Pool({
                    host,
                    port,
                    user,
                    password,
                    database,
                    max: Number(process.env.INTERNAL_DB_POOL_MAX ?? 10),
                })
            },
        },
    ],
    exports: ['INTERNAL_PG_POOL'],
})
export class DatabaseModule { }