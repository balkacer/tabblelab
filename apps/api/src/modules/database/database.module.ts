import { Module } from '@nestjs/common'
import { Pool } from 'pg'

@Module({
    providers: [
        {
            provide: 'INTERNAL_PG_POOL',
            useFactory: () => {
                const host = process.env.TABBLELAB_INTERNAL_DB_HOST ?? ''
                const port = Number(process.env.TABBLELAB_INTERNAL_DB_PORT ?? 0)
                const user = process.env.TABBLELAB_INTERNAL_DB_USER ?? ''
                const password =
                    process.env.TABBLELAB_INTERNAL_DB_PASSWORD ?? ''
                const database = process.env.TABBLELAB_INTERNAL_DB_NAME ?? ''
                const sslEnabled = process.env.TABBLELAB_INTERNAL_DB_SSL === 'true'

                return new Pool({
                    host,
                    port,
                    user,
                    password,
                    database,
                    max: Number(process.env.TABBLELAB_INTERNAL_DB_POOL_MAX ?? 10),
                    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
                })
            },
        },
    ],
    exports: ['INTERNAL_PG_POOL'],
})
export class DatabaseModule { }