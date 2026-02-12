export type SupportedDatabase = 'postgres'

export interface BaseConnectionConfig {
    type: SupportedDatabase
    name?: string
}

export interface PostgresConnectionConfig extends BaseConnectionConfig {
    type: 'postgres'
    host: string
    port: number
    database: string
    user: string
    password: string
    ssl?: boolean
}