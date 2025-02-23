import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { type User, UserRole } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { ProgressResponse } from '../progress/dto/progress.dto'

import {
	CreateLessonRequest,
	CreateLessonResponse,
	LessonResponse
} from './dto'
import { LessonService } from './lesson.service'

@ApiTags('Lesson')
@Controller('lessons')
export class LessonController {
	public constructor(private readonly lessonService: LessonService) {}

	@ApiOkResponse({
		type: LessonResponse
	})
	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async findBySlug(@Param('slug') slug: string) {
		return this.lessonService.findBySlug(slug)
	}

	@ApiOkResponse({
		type: ProgressResponse
	})
	@Authorization()
	@Get(':id/progress')
	@HttpCode(HttpStatus.OK)
	public async getCompletedLessons(
		@Authorized() user: User,
		@Param('id') id: string
	) {
		return this.lessonService.getCompletedLessons(user, id)
	}

	@ApiOkResponse({
		type: CreateLessonResponse
	})
	@Authorization(UserRole.ADMIN)
	@Post()
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateLessonRequest) {
		return this.lessonService.create(dto)
	}

	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				files: 1
			}
		})
	)
	@Authorization(UserRole.ADMIN)
	@Put(':id/upload')
	@HttpCode(HttpStatus.OK)
	public async upload(
		@Param('id') id: string,
		@UploadedFile() file: Express.Multer.File
	) {
		if (!file) {
			throw new BadRequestException('File is required')
		}

		return this.lessonService.upload(id, file)
	}
}
