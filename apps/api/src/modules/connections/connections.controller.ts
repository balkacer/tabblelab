import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
} from '@nestjs/common'
import { ConnectionManager } from './connection.manager'
import { CreateConnectionDto } from './dto/create-connection.dto'
import { QueryDto } from './dto/query.dto'

@Controller('connections')
export class ConnectionsController {
    constructor(
        private readonly connectionManager: ConnectionManager,
    ) { }

    @Post()
    async create(@Body() dto: CreateConnectionDto) {
        const id = await this.connectionManager.createConnection(dto)

        return {
            connectionId: id,
        }
    }

    @Get()
    list() {
        return this.connectionManager.listConnections()
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.connectionManager.closeConnection(id)

        return {
            message: 'Connection closed',
        }
    }

    @Post(':id/query')
    async query(
        @Param('id') id: string,
        @Body() dto: QueryDto,
    ) {
        const driver = this.connectionManager.getDriver(id)

        const result = await driver.query(dto.sql, {
            timeoutMs: dto.timeoutMs,
            rowLimit: dto.rowLimit,
        })

        return result
    }

    @Get(':id/tables')
    async tables(@Param('id') id: string) {
        const driver: any = this.connectionManager.getDriver(id)
        return driver.getTables()
    }

    @Get(':id/tables/:schema/:table/columns')
    async columns(
        @Param('id') id: string,
        @Param('schema') schema: string,
        @Param('table') table: string,
    ) {
        const driver: any = this.connectionManager.getDriver(id)
        return driver.getColumns(schema, table)
    }
}