

import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'
import { SupportedDatabase } from '@tabblelab/database-core'

export type UserConnectionRow = {
    id: string
    userId: string
    driver: SupportedDatabase
    name: string
    host: string
    port: number
    database: string
    passwordEnc: string | null
    user: string
    ssl: boolean | null
    createdAt: string
    updatedAt: string
    lastUsedAt: string | null
}

export type UpsertUserConnectionInput = {
    id?: string
    driver: SupportedDatabase
    name: string
    host: string
    port: number
    database: string
    user: string
    passwordEnc?: string
    ssl?: boolean
}

@Injectable()
export class UserConnectionsRepository implements OnModuleInit {
    constructor(@Inject('INTERNAL_PG_POOL') private readonly pool: Pool) { }

    async onModuleInit() {
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS user_connections (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
                user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                driver text NOT NULL,
                name text NOT NULL,
                host text NOT NULL,
                port int NOT NULL,
                database text NOT NULL,
                db_user text NOT NULL,
                password_enc text NULL,
                ssl boolean NOT NULL DEFAULT false,
                created_at timestamptz NOT NULL DEFAULT now (),
                updated_at timestamptz NOT NULL DEFAULT now (),
                last_used_at timestamptz NULL
            );

            CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections (user_id);
        `)
    }

    /**
     * List saved connection profiles for a given user.
     * NOTE: This does NOT include any password. Passwords should be re-entered or stored separately encrypted later.
     */
    async listByUserId(userId: string): Promise<UserConnectionRow[]> {
        const { rows } = await this.pool.query(
            `
            SELECT
                id,
                user_id as "userId",
                driver,
                name,
                host,
                port,
                database,
                db_user as "user",
                ssl,
                created_at as "createdAt",
                updated_at as "updatedAt",
                last_used_at as "lastUsedAt"
            FROM user_connections
            WHERE user_id = $1
            ORDER BY last_used_at DESC NULLS LAST, updated_at DESC
            `,
            [userId],
        )

        // pg returns timestamps as strings depending on driver config; we keep them as strings for transport
        return rows as UserConnectionRow[]
    }

    async findById(userId: string, id: string): Promise<UserConnectionRow | null> {
        const { rows } = await this.pool.query(
            `
            SELECT
                id,
                user_id as "userId",
                driver,
                name,
                host,
                port,
                database,
                db_user as "user",
                password_enc as "passwordEnc",
                ssl,
                created_at as "createdAt",
                updated_at as "updatedAt",
                last_used_at as "lastUsedAt"
            FROM user_connections
            WHERE user_id = $1 AND id = $2
            LIMIT 1
            `,
            [userId, id],
        )

        return (rows[0] as UserConnectionRow) ?? null
    }

    /**
     * Upsert a saved connection profile for a user.
     * - If id is omitted, creates a new profile.
     * - If id exists, updates it (only for that same user).
     * Returns the profile id.
     */
    async upsert(userId: string, input: UpsertUserConnectionInput): Promise<{ id: string }> {
        const id = input.id ?? randomUUID()
        const now = new Date()

        await this.pool.query(
            `
            INSERT INTO user_connections
                (id, user_id, driver, name, host, port, database, db_user, password_enc, ssl, created_at, updated_at, last_used_at)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, now()), $12, $13)
            ON CONFLICT (id)
            DO UPDATE SET
                user_id = EXCLUDED.user_id,
                driver = EXCLUDED.driver,
                name = EXCLUDED.name,
                host = EXCLUDED.host,
                port = EXCLUDED.port,
                database = EXCLUDED.database,
                db_user = EXCLUDED.db_user,
                password_enc = EXCLUDED.password_enc,
                ssl = EXCLUDED.ssl,
                updated_at = EXCLUDED.updated_at,
                last_used_at = EXCLUDED.last_used_at
            `,
            [
                id,
                userId,
                input.driver,
                input.name,
                input.host,
                input.port,
                input.database,
                input.user,
                input.passwordEnc ?? null,
                input.ssl ?? null,
                null, // created_at only set for inserts
                now,
                now,
            ],
        )

        return { id }
    }

    /**
     * Updates last_used_at to now for a profile owned by the user.
     * Returns true if updated, false if not found.
     */
    async touchLastUsed(userId: string, id: string): Promise<boolean> {
        const { rowCount } = await this.pool.query(
            `
            UPDATE user_connections
            SET last_used_at = now(), updated_at = now()
            WHERE user_id = $1 AND id = $2
            `,
            [userId, id],
        )
        return !!rowCount
    }

    /**
     * Delete a profile owned by the user.
     * Returns true if deleted, false if not found.
     */
    async delete(userId: string, id: string): Promise<boolean> {
        const { rowCount } = await this.pool.query(
            `DELETE FROM user_connections WHERE user_id = $1 AND id = $2`,
            [userId, id],
        )
        return !!rowCount
    }
}