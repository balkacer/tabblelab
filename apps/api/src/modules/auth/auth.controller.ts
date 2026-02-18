import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('register')
    async register(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
        const { user, token } = await this.auth.register(body.email, body.password)
        this.setCookie(res, token)
        return { user }
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
        const { user, token } = await this.auth.login(body.email, body.password)
        this.setCookie(res, token)
        return { user }
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(process.env.TABBLELAB_AUTH_COOKIE_NAME ?? 'tabblelab_token', {
            path: '/',
        })
        return { ok: true }
    }

    @Get('me')
    async me(@Req() req: Request) {
        const user = (req as any).user
        if (!user?.sub) throw new UnauthorizedException('Not authenticated')
        return this.auth.me(user.sub)
    }

    private setCookie(res: Response, token: string) {
        const name = process.env.TABBLELAB_AUTH_COOKIE_NAME ?? 'tabblelab_token'
        const secure = String(process.env.TABBLELAB_AUTH_COOKIE_SECURE ?? 'false') === 'true'

        res.cookie(name, token, {
            httpOnly: true,
            sameSite: secure ? 'none' : 'lax',
            secure,
            path: '/',
            // domain: optional
        })
    }
}