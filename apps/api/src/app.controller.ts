

import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
    @Get('/')
    root() {
        return {
            ok: true,
            service: 'tabblelab-api',
            message: 'TabbleLab API is running',
            timestamp: new Date().toISOString(),
        }
    }
}