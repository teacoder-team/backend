import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User, UserRole } from '@prisma/generated'

import { Authorization, Authorized } from '@/shared/decorators'

import { ActiveRestrictionResponse, CreateRestrictionRequest } from './dto'
import { RestrictionService } from './restriction.service'

@ApiTags('Restriction')
@Controller('restriction')
export class RestrictionController {
	public constructor(
		private readonly restrictionService: RestrictionService
	) {}

	@ApiOperation({
		summary: 'Get Active User Ban',
		description:
			'Retrieve information about the current active ban of the user, if any'
	})
	@ApiOkResponse({
		type: ActiveRestrictionResponse
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getActiveRestriction(@Authorized() user: User) {
		return this.restrictionService.getActiveRestriction(user)
	}

	@ApiOperation({
		summary: 'Create Restriction',
		description:
			'Restriction a user for a specific reason with optional expiration.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization(UserRole.ADMIN)
	@Post()
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateRestrictionRequest) {
		return this.restrictionService.create(dto)
	}

	@ApiOperation({
		summary: 'Cancel Restriction',
		description: 'Manually cancel an active restriction for a user.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization(UserRole.ADMIN)
	@Delete(':userId')
	@HttpCode(HttpStatus.OK)
	public async cancel(@Param('userId') userId: string) {
		return this.restrictionService.cancel(userId)
	}
}
