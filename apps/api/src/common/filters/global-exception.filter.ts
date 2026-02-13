import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { logger } from '../logger/logger.service'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const req = ctx.getRequest<Request>()
        const res = ctx.getResponse<Response>()

        const requestId = (req as any).requestId
        const method = req.method
        const path = req.originalUrl

        const isHttpException = exception instanceof HttpException

        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR

        // Mensaje seguro para el cliente
        const publicMessage = isHttpException
            ? this.getPublicMessage(exception)
            : 'Internal server error'

        // Cuerpo para el cliente (sin stack por defecto)
        const responseBody = {
            statusCode: status,
            message: publicMessage,
            path,
            method,
            requestId,
            timestamp: new Date().toISOString(),
        }

        // Logging (con más detalle internamente)
        const logPayload: Record<string, any> = {
            msg: 'Unhandled exception',
            requestId,
            method,
            path,
            statusCode: status,
        }

        if (isHttpException) {
            const response = exception.getResponse()
            logPayload.error = {
                name: exception.name,
                message: exception.message,
                response,
            }
            // 4xx: warn, 5xx: error
            if (status >= 500) logger.error(logPayload)
            else logger.warn(logPayload)
        } else {
            const err = exception as any
            logPayload.error = {
                name: err?.name ?? 'Error',
                message: err?.message ?? String(exception),
                stack: err?.stack,
            }
            logger.error(logPayload)
        }

        res.status(status).json(responseBody)
    }

    private getPublicMessage(exception: HttpException): string {
        const resp = exception.getResponse()
        if (typeof resp === 'string') return resp
        if (typeof resp === 'object' && resp && 'message' in resp) {
            const msg = (resp as any).message
            // Nest a veces retorna array de mensajes (validation)
            if (Array.isArray(msg)) return msg.join(', ')
            if (typeof msg === 'string') return msg
        }
        return exception.message
    }
}