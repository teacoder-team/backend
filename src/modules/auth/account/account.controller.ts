import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	Post,
	Req,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { User } from '@prisma/generated'
import type { Request } from 'express'

import { UserAgent } from '@/shared/decorators/user-agent.decorator'

import { Authorization } from '../../../shared/decorators/auth.decorator'
import { Authorized } from '../../../shared/decorators/authorized.decorator'

import { AccountService } from './account.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UserEntity } from './entities/user.entity'

@ApiTags('Account')
@Controller('auth/account')
export class AccountController {
	public constructor(private readonly accountService: AccountService) {}

	@ApiOperation({ summary: 'Получить данные текущего пользователя' })
	@ApiOkResponse({
		status: 200,
		description: 'Данные пользователя успешно получены',
		type: UserEntity
	})
	@ApiUnauthorizedResponse({
		status: 401,
		description: 'Пользователь не авторизован'
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetch(@Authorized() user: User) {
		return this.accountService.fetch(user)
	}

	@ApiOperation({ summary: 'Создать нового пользователя' })
	@ApiOkResponse({
		status: 200,
		description: 'Пользователь успешно создан'
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Некорректные данные для создания пользователя'
	})
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(
		@Req() req: Request,
		@Body() dto: CreateUserDto,
		@UserAgent() userAgent: string
	) {
		return this.accountService.create(req, dto, userAgent)
	}

	@ApiOperation({ summary: 'Изменить пароль пользователя' })
	@ApiOkResponse({
		status: 200,
		description: 'Пароль успешно изменен'
	})
	@ApiUnauthorizedResponse({
		status: 401,
		description: 'Пользователь не авторизован'
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Некорректные данные для изменения пароля'
	})
	@Authorization()
	@Patch('change/password')
	@HttpCode(HttpStatus.OK)
	public async changePassword(
		@Authorized() user: User,
		@Body() dto: ChangePasswordDto
	) {
		return this.accountService.changePassword(user, dto)
	}

	@ApiOperation({ summary: 'Изменить аватар пользователя' })
	@ApiOkResponse({
		status: 200,
		description: 'Аватар успешно обновлен'
	})
	@ApiUnauthorizedResponse({
		status: 401,
		description: 'Пользователь не авторизован'
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Неверный формат файла или файл слишком большой'
	})
	@ApiParam({
		name: 'file',
		description: 'Изображение аватара пользователя (файл)',
		required: true
	})
	@Authorization()
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				files: 1
			}
		})
	)
	@Patch('change/avatar')
	@HttpCode(HttpStatus.OK)
	public async changeAvatar(
		@Authorized() user: User,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({
						fileType: /\/(jpg|jpeg|png|gif|webp|avif)$/
					}),
					new MaxFileSizeValidator({
						maxSize: 1000 * 1000 * 5,
						message: 'Можно загружать файлы не больше 5 МБ'
					})
				]
			})
		)
		file: Express.Multer.File
	) {
		return this.accountService.changeAvatar(user, file)
	}
}
