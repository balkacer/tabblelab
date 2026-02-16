import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Req,
    HttpCode,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { ConnectionManager } from './connection.manager'
import { CreateConnectionRequestDto } from './dto/create-connection.dto'
import { QueryDto } from './dto/query.dto'
import { Request } from 'express'

@Controller('connections')
export class ConnectionsController {
    constructor(
        private readonly connectionManager: ConnectionManager,
    ) { }

    private requireUserId(req: Request): string {
        const userId = (req as any)?.user?.sub
        if (!userId) throw new UnauthorizedException('Authentication required')
        return String(userId)
    }

    @Post()
    async create(@Body() dto: CreateConnectionRequestDto, @Req() req: Request) {
        if ('profileConnectionId' in dto) {
            const userId = this.requireUserId(req)
            const profileId = String(dto.profileConnectionId)
            const id = await this.connectionManager.createConnectionFromProfile(profileId, userId, dto.password)
            return { connectionId: id }
        }

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
    @HttpCode(204)
    async delete(@Param('id') id: string) {
        try {
            await this.connectionManager.closeConnection(id)
        } catch (err: any) {
            // If the manager throws for missing connections, map it to a 404.
            const msg = String(err?.message ?? '')
            if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('unknown connection')) {
                throw new NotFoundException('Connection not found')
            }
            throw err
        }
        return
    }

    @Post(':id/query')
    async query(
        @Param('id') id: string,
        @Body() dto: QueryDto,
        @Req() req: Request,
    ) {
        const isAuthenticated = !!(req as any).user?.sub
        const requestedSafeMode = dto.safeMode ?? true
        const safeMode = isAuthenticated ? requestedSafeMode : true
        const driver = this.connectionManager.getDriver(id)

        const result = await driver.query(dto.sql, {
            timeoutMs: dto.timeoutMs,
            rowLimit: dto.rowLimit,
            safeMode,
        })

        return result
    }

    @Get(':id/tables')
    async tables(@Param('id') id: string) {
        const driver = this.connectionManager.getDriver(id)
        return driver.getTables()
    }

    @Get(':id/tables/:schema/:table/columns')
    async columns(
        @Param('id') id: string,
        @Param('schema') schema: string,
        @Param('table') table: string,
    ) {
        const driver = this.connectionManager.getDriver(id)
        return driver.getColumns(schema, table)
    }

    @Post(':id/query/:queryId/cancel')
    async cancel(
        @Param('id') id: string,
        @Param('queryId') queryId: string,
    ) {
        const driver = this.connectionManager.getDriver(id)
        const cancelled = await driver.cancelQuery(queryId)
        return { cancelled }
    }
}