import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Put
} from '@nestjs/common'
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { CreateProgressRequest, CreateProgressResponse } from './dto'
import { ProgressService } from './progress.service'

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
	public constructor(private readonly progressService: ProgressService) {}

	@ApiOperation({
		summary: 'Get Course Progress',
		description: 'Retrieve the progress of the user for a specific course.'
	})
	@ApiOkResponse({
		type: Number
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Get(':courseId')
	@HttpCode(HttpStatus.OK)
	public async getCourseProgress(
		@Authorized() user: User,
		@Param('courseId') courseId: string
	) {
		return this.progressService.getCourseProgress(user, courseId)
	}

	@ApiOperation({
		summary: 'Update Progress',
		description:
			'Update or create progress for a user in a specific course.'
	})
	@ApiOkResponse({
		type: CreateProgressResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Put()
	@HttpCode(HttpStatus.OK)
	public async create(
		@Authorized() user: User,
		@Body() dto: CreateProgressRequest
	) {
		return this.progressService.create(user, dto)
	}
}
