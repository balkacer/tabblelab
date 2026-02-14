import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.TABBLELAB_AUTH_JWT_SECRET,
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [JwtModule],
})
export class AuthModule { }