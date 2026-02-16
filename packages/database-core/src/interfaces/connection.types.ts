export const supportedDrivers = ['postgres'] as const

export type SupportedDatabase = typeof supportedDrivers[number]

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