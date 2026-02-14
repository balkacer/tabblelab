import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

export type UserRow = {
    id: string
    email: string
    password_hash: string
    created_at: string
}

@Injectable()
export class UsersRepository {
    constructor(@Inject('INTERNAL_PG_POOL') private readonly pool: Pool) { }

    async findByEmail(email: string): Promise<UserRow | null> {
        const res = await this.pool.query<UserRow>(
            `SELECT * FROM users WHERE email = $1 LIMIT 1`,
            [email.toLowerCase()],
        )
        return res.rows[0] ?? null
    }

    async findById(id: string): Promise<Pick<UserRow, 'id' | 'email' | 'created_at'> | null> {
        const res = await this.pool.query(
            `SELECT id, email, created_at FROM users WHERE id = $1 LIMIT 1`,
            [id],
        )
        return res.rows[0] ?? null
    }

    async create(email: string, passwordHash: string): Promise<Pick<UserRow, 'id' | 'email' | 'created_at'>> {
        const res = await this.pool.query(
            `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, created_at`,
            [email.toLowerCase(), passwordHash],
        )
        return res.rows[0]
    }
}