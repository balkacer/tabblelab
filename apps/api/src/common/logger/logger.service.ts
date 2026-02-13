import pino, { LoggerOptions } from 'pino'

const isProd = process.env.NODE_ENV === 'production'

const options: LoggerOptions = {
    level: process.env.LOG_LEVEL ?? 'info',

    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.x-tabblelab-master-key',
            'password',
            'dbPassword',
            '*.password',
            '*.secret',
            '*.token',
            'sql', // opcional si quieres ocultar SQL completo
        ],
        censor: '[REDACTED]',
    },

    transport: !isProd
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
}

export const logger = pino(options)