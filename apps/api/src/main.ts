import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'

@Module({})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(4000)
  console.log('TabbleLab API running on http://localhost:4000')
}

bootstrap()
