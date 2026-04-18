import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { SystemService } from './system.service'

@Controller()
export class SystemController {
	public constructor(private readonly systemService: SystemService) {}

	@ApiOperation({
		summary: 'Welcome endpoint'
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async hello() {
		return this.systemService.hello()
	}

	@ApiOperation({
		summary: 'Health check'
	})
	@Get('health')
	@HttpCode(HttpStatus.OK)
	public async health() {
		return this.systemService.health()
	}
}
