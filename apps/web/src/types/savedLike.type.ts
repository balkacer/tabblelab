import { ConnectionDriver } from "./connectionDriver.type"

export type SavedLike = {
    id: string
    driver: ConnectionDriver
    name: string
    host: string
    port: number
    database: string
    user: string
    isLocal: boolean
    ssl: boolean
}