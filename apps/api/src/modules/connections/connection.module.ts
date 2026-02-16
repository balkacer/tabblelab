import { Module } from '@nestjs/common'
import { ConnectionManager } from './connection.manager'
import { ConnectionsController } from './connections.controller'
import { UserConnectionsController } from './userConnections/userConnections.controller'
import { DatabaseModule } from '../database/database.module'
import { UserConnectionsService } from './userConnections/userConnections.service'
import { UserConnectionsRepository } from './userConnections/userConnections.repository'

@Module({
    imports: [DatabaseModule],
    providers: [ConnectionManager, UserConnectionsService, UserConnectionsRepository],
    controllers: [ConnectionsController, UserConnectionsController],
    exports: [ConnectionManager, UserConnectionsService, UserConnectionsRepository],
})
export class ConnectionModule { }