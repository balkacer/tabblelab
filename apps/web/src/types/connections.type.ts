import { ConnectionDriver } from "./connectionDriver.type"

export class CreateConnectionDto {
    id?: string
    driver!: ConnectionDriver
    host!: string
    port!: number
    database!: string
    user!: string
    password?: string
    ssl?: boolean
}