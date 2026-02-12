import { Module } from '@nestjs/common'
import { ConnectionManager } from './connection.manager'
import { ConnectionsController } from './connections.controller'

@Module({
    providers: [ConnectionManager],
    controllers: [ConnectionsController],
    exports: [ConnectionManager],
})
export class ConnectionModule { }