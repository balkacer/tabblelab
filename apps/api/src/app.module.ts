import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SecurityModule } from './modules/security/security.module'
import { ConnectionModule } from './modules/connections/connection.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        SecurityModule,
        ConnectionModule,
    ],
})
export class AppModule { }