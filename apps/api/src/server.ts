import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import type { INestApplication } from '@nestjs/common'
import express, { type Request, type Response } from 'express'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import cookieParser from 'cookie-parser'

let cachedApp: INestApplication | null = null
let cachedExpress: ReturnType<typeof express> | null = null

async function bootstrap() {
    if (cachedApp && cachedExpress) return { app: cachedApp, server: cachedExpress }

    const server = express()
    const adapter = new ExpressAdapter(server)

    const app = await NestFactory.create(AppModule, adapter)

    app.useGlobalFilters(new GlobalExceptionFilter())

    app.use(cookieParser())

    app.enableCors({
        origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
            const allowedOrigins = (process.env.TABBLELAB_CORS_ORIGINS ?? '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)

            if (!origin) return callback(null, true)
            if (allowedOrigins.includes(origin)) return callback(null, true)
            return callback(new Error(`CORS blocked for origin: ${origin}`), false)
        },
        credentials: true,
    })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    await app.init()

    cachedApp = app
    cachedExpress = server
    return { app, server }
}

export default async function handler(req: Request, res: Response) {
    const { server } = await bootstrap()
    return server(req, res)
}