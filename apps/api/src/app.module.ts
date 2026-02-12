import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SecurityModule } from './modules/security/security.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        SecurityModule,
    ],
})
export class AppModule { }