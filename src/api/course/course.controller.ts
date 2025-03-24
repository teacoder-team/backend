import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { UserRole } from '@prisma/generated'

import { Authorization } from '@/common/decorators/auth.decorator'

import { LessonResponse } from '../lesson/dto'

import { CourseService } from './course.service'
import {
	CourseResponse,
	CreateCourseRequest,
	CreateCourseResponse
} from './dto'

@ApiTags('Course')
@Controller('courses')
export class CourseController {
	public constructor(private readonly courseService: CourseService) {}

	@ApiOperation({
		summary: 'Fetch All Courses',
		description: 'Retrieve a list of all available courses.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: [CourseResponse]
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		return this.courseService.getAll()
	}

	@ApiOperation({
		summary: 'Get Popular Courses',
		description:
			'Retrieve a list of the most popular courses based on views.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: [CourseResponse]
	})
	@Get('popular')
	@HttpCode(HttpStatus.OK)
	public async getPopular() {
		return this.courseService.getPopular()
	}

	@ApiOperation({
		summary: 'Get Course By Slug',
		description: 'Retrieve a course using its unique slug identifier.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: CourseResponse
	})
	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param('slug') slug: string) {
		return this.courseService.getBySlug(slug)
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
		return this.courseService.getCourseLessons(id)
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
		await this.courseService.incrementViews(id)
	}

	@ApiOperation({
		summary: 'Create New Course',
		description: 'Create a new course.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: CreateCourseResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization(UserRole.ADMIN)
	@Post()
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateCourseRequest) {
		return this.courseService.create(dto)
	}
}
