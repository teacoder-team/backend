import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@prisma/generated'

import { Authorization } from '@/common/decorators/auth.decorator'

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
		summary: 'Find course by slug',
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

	@ApiOperation({
		summary: 'Create a new course',
		description: 'Allows an admin to create a new course.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: CreateCourseResponse
	})
	@Authorization(UserRole.ADMIN)
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateCourseRequest) {
		return this.courseService.create(dto)
	}
}
