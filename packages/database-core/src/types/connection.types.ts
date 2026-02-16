export const supportedDrivers = ['postgres'] as const

export type SupportedDatabase = typeof supportedDrivers[number]

export interface BaseConnectionConfig {
    driver: SupportedDatabase
    name?: string
}

export interface PostgresConnectionConfig extends BaseConnectionConfig {
    driver: 'postgres'
    host: string
    port: number
    database: string
    user: string
    password: string
    ssl?: boolean
}