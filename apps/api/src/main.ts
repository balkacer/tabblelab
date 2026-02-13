import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]

  app.enableCors({
    origin: (origin: string, callback: (arg0: Error | null, arg1: boolean) => any) => {
      // Permite tools sin origin (curl, postman)
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

  app.useGlobalFilters(new GlobalExceptionFilter())

  const port = Number(process.env.PORT ?? 4000)
  await app.listen(port, '0.0.0.0')
  console.log(`TabbleLab API running on port ${port}`)
}

bootstrap()