import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Res
} from '@nestjs/common'
import {
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { User, UserRole } from '@prisma/generated'
import { Response } from 'express'

import { LessonResponse } from '@/api/lesson/dto'
import {
	Authorized,
	ClientIp,
	PremiumOnly,
	UserAgent
} from '@/shared/decorators'
import { Authorization } from '@/shared/decorators/auth.decorator'

import { CourseResponse } from '../../application/dto/course.response'
import { CoursesResponse } from '../../application/dto/courses.response'
import { CreateCourseRequest } from '../../application/dto/create-course.request'
import { CreateCourseResponse } from '../../application/dto/create-course.response'
import { GenerateDownloadLinkResponse } from '../../application/dto/generate-download-link.response'
import { CourseApplicationService } from '../../application/services/course.application.service'

@ApiTags('Course')
@Controller('courses')
export class CourseController {
	public constructor(private readonly app: CourseApplicationService) {}

	@ApiOperation({
		summary: 'Fetch All Courses',
		description: 'Retrieve a list of all available courses.'
	})
	@ApiOkResponse({
		type: [CoursesResponse]
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		return this.app.getAll()
	}

	@ApiOperation({
		summary: 'Get Popular Courses',
		description:
			'Retrieve a list of the most popular courses based on views.'
	})
	@ApiOkResponse({
		type: [CoursesResponse]
	})
	@Get('popular')
	@HttpCode(HttpStatus.OK)
	public async getPopular() {
		return this.app.getPopular()
	}

	@ApiOperation({
		summary: 'Get Course By Slug',
		description: 'Retrieve a course using its unique slug identifier.'
	})
	@ApiOkResponse({
		type: CourseResponse
	})
	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param('slug') slug: string) {
		return this.app.getBySlug(slug)
	}

	@ApiOperation({
		summary: 'Get Lessons For Course',
		description: 'Retrieve all published lessons of a course.'
	})
	@ApiOkResponse({
		type: [LessonResponse]
	})
	@Get(':id/lessons')
	@HttpCode(HttpStatus.OK)
	public async getCourseLessons(@Param('id') id: string) {
		return this.app.getCourseLessons(id)
	}

	@ApiOperation({
		summary: 'Increment Course Views',
		description: 'Increase the view count of a course by 1.'
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT
	})
	@Patch(':id/views')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async incrementViews(@Param('id') id: string) {
		await this.app.incrementViews(id)
	}

	@ApiOperation({
		summary: 'Generate download link',
		description: 'Generates a secure download link for a course.'
	})
	@ApiOkResponse({
		type: GenerateDownloadLinkResponse
	})
	@Authorization()
	@PremiumOnly()
	@Post(':id/download-link')
	@HttpCode(HttpStatus.OK)
	public async generateDownloadLink(
		@Param('id') id: string,
		@Authorized() user: User
	) {
		return await this.app.generateDownloadLink(id, user)
	}

	@ApiOperation({
		summary: 'Resolve download token',
		description:
			'Resolves a download token to stream the course attachment.'
	})
	@ApiOkResponse({
		description:
			'The requested course file is streamed as a ZIP attachment.'
	})
	@Get('download/:token')
	@HttpCode(HttpStatus.OK)
	public async resolveDownloadToken(
		@Param('token') token: string,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string,
		@Res() res: Response
	) {
		const course = await this.app.resolveDownloadToken(token, ip, userAgent)

		try {
			const { stream, contentType } =
				await this.app.fetchAttachmentStream(course.attachment)

			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${encodeURIComponent(course.title)}.zip"`
			)
			res.setHeader('Content-Type', contentType as string)

			stream.pipe(res)
		} catch (err) {
			console.error(err)
			res.status(500).end()
		}
	}

	@ApiOperation({
		summary: 'Create New Course',
		description: 'Create a new course.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: CreateCourseResponse
	})
	@Authorization(UserRole.ADMIN)
	@Post()
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateCourseRequest) {
		return this.app.create(dto)
	}
}
