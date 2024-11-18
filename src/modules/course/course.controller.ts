import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Patch,
	Post,
	UploadedFile
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@prisma/generated'

import { Authorization } from '@/shared/decorators/auth.decorator'

import { CourseService } from './course.service'
import { CreateCourseDto } from './dto/create-course.dto'

@ApiTags('Course')
@Controller('course')
export class CourseController {
	public constructor(private readonly courseService: CourseService) {}

	@Get('by-slug/:slug')
	@HttpCode(HttpStatus.OK)
	public async findBySlug(@Param('slug') slug: string) {
		return this.courseService.findBySlug(slug)
	}

	@Authorization(UserRole.ADMIN)
	@Get('by-id/:id')
	@HttpCode(HttpStatus.OK)
	public async findById(@Param('id') id: string) {
		return this.courseService.findById(id)
	}

	@Authorization(UserRole.ADMIN)
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(@Body() dto: CreateCourseDto) {
		return this.courseService.create(dto)
	}

	@Authorization(UserRole.ADMIN)
	@Patch('change/thumbnail/:id')
	@HttpCode(HttpStatus.OK)
	public async changeThumbnail(
		@Param('id') id: string,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({
						fileType: /\/(jpg|jpeg|png|webp)$/
					}),
					new MaxFileSizeValidator({
						maxSize: 1000 * 1000 * 10,
						message: 'Можно загружать файлы не больше 10 МБ'
					})
				]
			})
		)
		file: Express.Multer.File
	) {
		return this.courseService.changeThumbnail(id, file)
	}
}
