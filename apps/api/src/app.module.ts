import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SecurityModule } from './modules/security/security.module'
import { ConnectionModule } from './modules/connections/connection.module'
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware'
import { HealthModule } from './modules/health/health.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        SecurityModule,
        ConnectionModule,
        HealthModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*')
    }
}