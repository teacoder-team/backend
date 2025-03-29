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
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
import { User, UserRole } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { CreateRestrictionRequest } from './dto'
import { ActiveRestrictionResponse } from './dto/active-restriction.dto'
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
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
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
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
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
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization(UserRole.ADMIN)
	@Delete(':userId')
	@HttpCode(HttpStatus.OK)
	public async cancel(@Param('userId') userId: string) {
		return this.restrictionService.cancel(userId)
	}
}
