import { Controller, Get } from '@nestjs/common'

import { ClientIp } from '@/shared/decorators'

import { SystemService } from './system.service'

@Controller()
export class SystemController {
	public constructor(private readonly systemService: SystemService) {}

	@Get()
	public getConfig(@ClientIp() ip: string) {
		return this.systemService.getConfig(ip)
	}
}
