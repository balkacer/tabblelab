import { ConnectionDriver } from "./connectionDriver.type"

export type ProfileConnection = {
    id: string
    driver: ConnectionDriver
    name: string
    host: string
    port: number
    database: string
    user: string
    ssl: boolean | null
    createdAt: string
    updatedAt: string
    lastUsedAt: string | null
}