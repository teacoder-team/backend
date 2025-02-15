import {
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation } from '@nestjs/swagger'
import { type User, UserRole } from '@prisma/generated'

import { Authorization } from '@/common/decorators/auth.decorator'
import { Authorized } from '@/common/decorators/authorized.decorator'

import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	public constructor(private readonly usersService: UsersService) {}

	@ApiOperation({
		summary: 'Fetch All'
	})
	@Authorization(UserRole.ADMIN)
	@Get()
	@HttpCode(HttpStatus.OK)
	public async findAll() {
		return this.usersService.findAll()
	}

	@ApiOperation({ summary: 'Изменить аватар пользователя' })
	@Authorization()
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				files: 1
			}
		})
	)
	@Patch('@me/avatar')
	@HttpCode(HttpStatus.OK)
	public async changeAvatar(
		@Authorized() user: User,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({
						fileType: /\/(jpg|jpeg|png|gif|webp)$/
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
		return this.usersService.changeAvatar(user, file)
	}
}
