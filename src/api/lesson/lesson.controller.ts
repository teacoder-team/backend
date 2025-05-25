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
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
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

	@ApiOperation({
		summary: 'Get Lesson By Slug',
		description: 'Retrieve lesson information by slug. '
	})
	@ApiOkResponse({
		type: LessonResponse
	})
	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param('slug') slug: string) {
		return this.lessonService.getBySlug(slug)
	}

	@ApiOperation({
		summary: 'Fetch Completed Lessons Progress',
		description:
			'Retrieve the IDs of the completed lessons for the given course. '
	})
	@ApiOkResponse({
		type: ProgressResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
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

	@ApiOperation({
		summary: 'Create New Lesson',
		description: 'Create a new lesson.'
	})
	@ApiOkResponse({
		type: CreateLessonResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization(UserRole.ADMIN)
	@Post()
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateLessonRequest) {
		return this.lessonService.create(dto)
	}

	@ApiOperation({
		summary: 'Upload Lesson Video',
		description: 'Upload a video file associated with the lesson.'
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization(UserRole.ADMIN)
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				files: 1
			}
		})
	)
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
