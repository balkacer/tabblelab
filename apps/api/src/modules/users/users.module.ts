import { Module } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { DatabaseModule } from '../database/database.module'

@Module({
    imports: [DatabaseModule],
    providers: [UsersRepository],
    exports: [UsersRepository],
})
export class UsersModule { }