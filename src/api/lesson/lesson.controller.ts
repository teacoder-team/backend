import {
	BadRequestException,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@prisma/generated'

import { Authorization } from '@/common/decorators'

import { LessonService } from './lesson.service'

@ApiTags('Lesson')
@Controller('lessons')
export class LessonController {
	public constructor(private readonly lessonService: LessonService) {}

	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				files: 1
			}
		})
	)
	@Authorization(UserRole.ADMIN)
	@Post(':id/upload')
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
