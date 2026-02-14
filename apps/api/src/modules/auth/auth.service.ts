import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { UsersRepository } from '../users/users.repository'

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly jwt: JwtService,
    ) { }

    async register(email: string, password: string) {
        if (!email || !password) throw new BadRequestException('Email and password are required')
        if (password.length < 8) throw new BadRequestException('Password must be at least 8 characters')

        const existing = await this.usersRepo.findByEmail(email)
        if (existing) throw new BadRequestException('Email is already registered')

        const passwordHash = await bcrypt.hash(password, 12)
        const user = await this.usersRepo.create(email, passwordHash)
        const token = await this.signToken(user.id, user.email)

        return { user, token }
    }

    async login(email: string, password: string) {
        const user = await this.usersRepo.findByEmail(email)
        if (!user) throw new UnauthorizedException('Invalid credentials')

        const ok = await bcrypt.compare(password, user.password_hash)
        if (!ok) throw new UnauthorizedException('Invalid credentials')

        const token = await this.signToken(user.id, user.email)
        return {
            user: { id: user.id, email: user.email, created_at: user.created_at },
            token,
        }
    }

    async me(userId: string) {
        const user = await this.usersRepo.findById(userId)
        if (!user) throw new UnauthorizedException('Invalid session')
        return user
    }

    private async signToken(userId: string, email: string) {
        const ttlRaw = process.env.TABBLELAB_AUTH_TOKEN_TTL ?? '7d'

        // `expiresIn` typing in jsonwebtoken may be `number | ms.StringValue`.
        // Env vars are plain `string`, so we normalize/cast safely.
        const expiresIn =
            /^\d+$/.test(ttlRaw) ? Number(ttlRaw) : (ttlRaw as any)

        return this.jwt.signAsync({ sub: userId, email }, { expiresIn })
    }
}