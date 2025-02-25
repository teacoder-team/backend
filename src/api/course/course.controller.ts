import {
	Body,
	Controller,
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
		summary: 'Fetch all courses',
		description: 'Retrieve a list of all available courses.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: [CourseResponse]
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async findAll() {
		return this.courseService.findAll()
	}

	@ApiOperation({
		summary: 'Find Course By Slug',
		description: 'Retrieve a course using its unique slug identifier.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: CourseResponse
	})
	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async findBySlug(@Param('slug') slug: string) {
		return this.courseService.findBySlug(slug)
	}

	@ApiOkResponse({
		type: [LessonResponse]
	})
	@Get(':id/lessons')
	@HttpCode(HttpStatus.OK)
	public async getCourseLessons(@Param('id') id: string) {
		return this.courseService.getCourseLessons(id)
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
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateCourseRequest) {
		return this.courseService.create(dto)
	}
}
