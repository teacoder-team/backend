import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Put
} from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { CreateProgressRequest, CreateProgressResponse } from './dto'
import { ProgressService } from './progress.service'

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
	public constructor(private readonly progressService: ProgressService) {}

	@ApiOkResponse({
		type: Number
	})
	@Authorization()
	@Get(':courseId')
	@HttpCode(HttpStatus.OK)
	public async getProgress(
		@Authorized() user: User,
		@Param('courseId') courseId: string
	) {
		return this.progressService.getProgress(user, courseId)
	}

	@ApiOkResponse({
		type: CreateProgressResponse
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
