import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SecurityModule } from './modules/security/security.module'
import { ConnectionModule } from './modules/connections/connection.module'
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware'
import { HealthModule } from './modules/health/health.module'
import { AuthContextMiddleware } from './common/middleware/auth-context.middleware'
import { AuthModule } from './modules/auth/auth.module'
import { DatabaseModule } from './modules/database/database.module'
import { AppController } from './app.controller'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        SecurityModule,
        ConnectionModule,
        HealthModule,
        DatabaseModule,
        AuthModule,
    ],
    controllers: [AppController],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthContextMiddleware).forRoutes('*')
        consumer.apply(RequestLoggerMiddleware).forRoutes('*')
    }
}