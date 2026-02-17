import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalFilters(new GlobalExceptionFilter())

  app.use(cookieParser())

  app.enableCors({
    origin: (origin: string, callback: (arg0: Error | null, arg1: boolean) => any) => {

      const allowedOrigins = (process.env.TABBLELAB_CORS_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean)

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

  const port = Number(process.env.PORT ?? 4000)
  await app.listen(port, '0.0.0.0')
  console.log(`TabbleLab API running on port ${port}`)
}

bootstrap()