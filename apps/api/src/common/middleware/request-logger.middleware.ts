import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { logger } from '../logger/logger.service'

declare global {
    namespace Express {
        interface Request {
            requestId: string
        }
    }
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const requestId = randomUUID()

        req['requestId'] = requestId

        const start = Date.now()

        logger.info({
            msg: 'Incoming request',
            requestId,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
        })

        res.on('finish', () => {
            const duration = Date.now() - start

            logger.info({
                msg: 'Request completed',
                requestId,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                durationMs: duration,
            })
        })

        res.setHeader('x-request-id', requestId)

        next()
    }
}