import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common'
import type { Request } from 'express'
import { UpsertUserConnectionDto } from '../dto/upsert-user-connection.dto'
import { UserConnectionsService } from './userConnections.service'

@Controller('me/connections')
export class UserConnectionsController {
    constructor(private readonly userConnectionsService: UserConnectionsService) { }

    private requireUserId(req: Request): string {
        const userId = (req as any)?.user?.sub
        if (!userId) throw new UnauthorizedException('Authentication required')
        return String(userId)
    }

    @Get()
    async list(@Req() req: Request) {
        const userId = this.requireUserId(req)
        return this.userConnectionsService.list(userId)
    }

    @Post()
    async upsert(@Req() req: Request, @Body() body: UpsertUserConnectionDto) {
        const userId = this.requireUserId(req)
        return this.userConnectionsService.upsert(userId, body)
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Req() req: Request, @Param('id') id: string) {
        const userId = this.requireUserId(req)
        await this.userConnectionsService.delete(userId, id)
        return
    }
}