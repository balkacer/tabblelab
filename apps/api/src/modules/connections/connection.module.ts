import { Module } from '@nestjs/common'
import { ConnectionManager } from './connection.manager'

@Module({
    providers: [ConnectionManager],
    exports: [ConnectionManager],
})
export class ConnectionModule { }