import {
	Body,
	Controller,
	Delete,
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
import { UserRole } from '@prisma/generated'

import { Authorization } from '@/common/decorators'

import { CreateRestrictionRequest } from './dto'
import { RestrictionService } from './restriction.service'

@ApiTags('Restriction')
@Controller('restriction')
export class RestrictionController {
	public constructor(
		private readonly restrictionService: RestrictionService
	) {}

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
