import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@prisma/generated'

import { Authorization } from '@/shared/decorators'

import { RegistrationsResponse, StatisticsResponse } from './dto'
import { StatisticsService } from './statistics.service'

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
	public constructor(private readonly statisticsService: StatisticsService) {}

	@ApiOperation({
		summary: 'Get General Statistics',
		description: 'Returns the number of users, courses, views, and lessons.'
	})
	@ApiOkResponse({
		type: StatisticsResponse
	})
	@Authorization(UserRole.ADMIN)
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getStatistics() {
		return this.statisticsService.getStatistics()
	}

	@ApiOperation({
		summary: 'Get User Registrations',
		description: 'Returns the number of user registrations per day.'
	})
	@ApiOkResponse({
		type: [RegistrationsResponse]
	})
	@Authorization(UserRole.ADMIN)
	@Get('registrations')
	@HttpCode(HttpStatus.OK)
	public async getUserRegistrations() {
		return this.statisticsService.getUserRegistrations()
	}
}
