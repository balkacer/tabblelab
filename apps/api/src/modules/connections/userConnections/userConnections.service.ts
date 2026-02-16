import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { UserConnectionsRepository, UserConnectionRow } from './userConnections.repository'
import { UpsertUserConnectionDto } from '../dto/upsert-user-connection.dto'
import { SupportedDatabase, supportedDrivers } from '@tabblelab/database-core'
import { EncryptionService } from '../../security/encryption.service'

export type UserConnectionProfile = Omit<UserConnectionRow, 'userId'>

function normalizeString(v: unknown): string {
    return String(v ?? '').trim()
}

function normalizePort(v: unknown): number {
    const n = Number(v)
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return NaN
    return n
}

function normalizeDriver(v: unknown): SupportedDatabase {
    const d = normalizeString(v).toLowerCase()
    if (supportedDrivers.includes(d as any)) return d as SupportedDatabase
    return supportedDrivers[0] // default to first supported driver if invalid
}

function mapRow(row: UserConnectionRow): UserConnectionProfile {
    return {
        id: row.id,
        driver: row.driver,
        name: row.name,
        host: row.host,
        port: row.port,
        database: row.database,
        user: row.user,
        passwordEnc: row.passwordEnc ?? null,
        ssl: row.ssl ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        lastUsedAt: row.lastUsedAt ?? null,
    }
}

@Injectable()
export class UserConnectionsService {
    constructor(private readonly repo: UserConnectionsRepository,
        private readonly encryptionService: EncryptionService
    ) { }

    async list(userId: string): Promise<UserConnectionProfile[]> {
        const uid = normalizeString(userId)
        if (!uid) throw new BadRequestException('Invalid userId')
        const rows = await this.repo.listByUserId(uid)
        return rows.map(mapRow)
    }

    async getById(userId: string, profileId: string): Promise<UserConnectionProfile> {
        const uid = normalizeString(userId)
        if (!uid) throw new BadRequestException('Invalid userId')

        const id = normalizeString(profileId)
        if (!id) throw new BadRequestException('Invalid profile id')

        const row = await this.repo.findById(uid, id)
        if (!row) throw new NotFoundException('Connection profile not found')

        return mapRow(row)
    }

    async upsert(userId: string, dto: UpsertUserConnectionDto): Promise<{ id: string }> {
        const uid = normalizeString(userId)
        if (!uid) throw new BadRequestException('Invalid userId')

        const id = dto?.id ? normalizeString(dto.id) : undefined
        const driver = normalizeDriver((dto as any)?.driver)
        const name = normalizeString((dto as any)?.name)
        const host = normalizeString((dto as any)?.host)
        const database = normalizeString((dto as any)?.database)
        const dbUser = normalizeString((dto as any)?.user)
        const passwordEnc = dto.password ? this.encryptionService.encryptSecret(dto.password) : undefined
        const port = normalizePort((dto as any)?.port)
        const ssl = typeof (dto as any)?.ssl === 'boolean' ? (dto as any).ssl : undefined

        if (!name) throw new BadRequestException('name is required')
        if (!host) throw new BadRequestException('host is required')
        if (!database) throw new BadRequestException('database is required')
        if (!dbUser) throw new BadRequestException('user is required')
        if (!port) throw new BadRequestException('port must be a positive integer')

        return this.repo.upsert(uid, {
            id,
            driver,
            name,
            host,
            port,
            database,
            user: dbUser,
            passwordEnc,
            ssl,
        })
    }

    async delete(userId: string, profileId: string): Promise<void> {
        const uid = normalizeString(userId)
        if (!uid) throw new BadRequestException('Invalid userId')

        const id = normalizeString(profileId)
        if (!id) throw new BadRequestException('Invalid profile id')

        const ok = await this.repo.delete(uid, id)
        if (!ok) throw new NotFoundException('Connection profile not found')
        return
    }

    /**
     * Optional helper for later: update last-used time when a profile is used to connect.
     */
    async touchLastUsed(userId: string, profileId: string): Promise<void> {
        const uid = normalizeString(userId)
        if (!uid) return
        const id = normalizeString(profileId)
        if (!id) return
        await this.repo.touchLastUsed(uid, id)
    }
}