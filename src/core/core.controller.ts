import { Controller, Get } from '@nestjs/common'

import { ClientIp } from '@/shared/decorators'

import { CoreService } from './core.service'

@Controller()
export class CoreController {
	public constructor(private readonly coreService: CoreService) {}

	@Get()
	public getConfig(@ClientIp() ip: string) {
		return this.coreService.getConfig(ip)
	}
}
