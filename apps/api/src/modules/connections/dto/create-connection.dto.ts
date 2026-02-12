import { PostgresConnectionConfig } from '@tabblelab/database-core'

export class CreateConnectionDto implements PostgresConnectionConfig {
    type!: 'postgres'
    host!: string
    port!: number
    database!: string
    user!: string
    password!: string
    ssl?: boolean
    name?: string
}