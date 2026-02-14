import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
    constructor(private readonly jwt: JwtService) { }

    async use(req: Request, _res: Response, next: NextFunction) {
        const cookieName = process.env.TABBLELAB_AUTH_COOKIE_NAME ?? 'tabblelab_token'
        const token = (req as any).cookies?.[cookieName]
        if (!token) return next()

        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: process.env.TABBLELAB_AUTH_JWT_SECRET,
            })
                ; (req as any).user = payload
        } catch {
            // ignore invalid/expired token
        }
        next()
    }
}