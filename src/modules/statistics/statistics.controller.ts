import { Controller } from '@nestjs/common'

import { StatisticsService } from './statistics.service'

@Controller('statistics')
export class StatisticsController {
	public constructor(private readonly statisticsService: StatisticsService) {}
}
