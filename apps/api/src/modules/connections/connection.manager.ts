import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
    PostgresConnectionConfig,
    DatabaseDriver,
} from '@tabblelab/database-core'
import { PostgresDriver } from '../drivers/postgres.driver'

interface ManagedConnection {
    id: string
    driver: DatabaseDriver
    createdAt: Date
}

@Injectable()
export class ConnectionManager {
    private connections = new Map<string, ManagedConnection>()

    async createConnection(
        config: PostgresConnectionConfig,
    ): Promise<string> {
        let driver: DatabaseDriver

        switch (config.type) {
            case 'postgres':
                driver = new PostgresDriver(config)
                break
            default:
                throw new BadRequestException('Unsupported database type')
        }

        try {
            await driver.connect()
        } catch (err: any) {
            // casos típicos:
            // ENETUNREACH, ECONNREFUSED, ETIMEDOUT, EAI_AGAIN, ENOTFOUND
            const code = err?.code
            if (['ENETUNREACH', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND'].includes(code)) {
                throw new BadGatewayException(
                    `Cannot reach database host (${code}). If using Docker Compose, set host to "db".`,
                )
            }

            throw new BadRequestException('Failed to create connection. Please verify credentials and host.')
        }

        const id = randomUUID()

        this.connections.set(id, {
            id,
            driver,
            createdAt: new Date(),
        })

        return id
    }

    getDriver(connectionId: string): DatabaseDriver {
        const connection = this.connections.get(connectionId)

        if (!connection) {
            throw new NotFoundException('Connection not found')
        }

        return connection.driver
    }

    async closeConnection(connectionId: string): Promise<void> {
        const connection = this.connections.get(connectionId)

        if (!connection) {
            throw new NotFoundException('Connection not found')
        }

        await connection.driver.disconnect()
        this.connections.delete(connectionId)
    }

    listConnections() {
        return Array.from(this.connections.values()).map((c) => ({
            id: c.id,
            createdAt: c.createdAt,
        }))
    }
}