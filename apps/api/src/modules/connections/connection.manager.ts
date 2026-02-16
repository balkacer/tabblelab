import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
    PostgresConnectionConfig,
    DatabaseDriver,
} from '@tabblelab/database-core'
import { PostgresDriver } from '../drivers/postgres.driver'
import { UserConnectionsService } from './userConnections/userConnections.service'
import { EncryptionService } from '../security/encryption.service'

interface ManagedConnection {
    id: string
    driver: DatabaseDriver
    createdAt: Date
}

@Injectable()
export class ConnectionManager {
    private connections = new Map<string, ManagedConnection>()

    constructor(
        private readonly userConnectionsService: UserConnectionsService,
        private readonly encryptionService: EncryptionService
    ) { }

    async createConnection(
        config: PostgresConnectionConfig,
    ): Promise<string> {
        let driver: DatabaseDriver

        switch (config.driver) {
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

    async createConnectionFromProfile(profileId: string, userId: string, password?: string): Promise<string> {
        const profile = await this.userConnectionsService.getById(userId, profileId)

        if (!profile) {
            throw new NotFoundException('Connection profile not found')
        }

        let dbPassword: string | undefined = undefined

        if (password) {
            dbPassword = password
        } else if (profile.passwordEnc) {
            try {
                dbPassword = this.encryptionService.decryptSecret(profile.passwordEnc)
            } catch (err) {
                throw new BadGatewayException('Failed to decrypt database password, please provide it in the request body')
            }
        } else {
            throw new BadRequestException('No password provided for connection profile')
        }

        const config: PostgresConnectionConfig = {
            driver: profile.driver,
            host: profile.host,
            port: profile.port,
            database: profile.database,
            user: profile.user,
            password: dbPassword,
            ssl: profile.ssl ?? undefined,
        }

        return this.createConnection(config)
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