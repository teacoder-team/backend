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
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { type User, UserRole } from '@prisma/generated'

import { Authorization } from '@/common/decorators/auth.decorator'
import { Authorized } from '@/common/decorators/authorized.decorator'

import { PatchUserRequest, UserResponse } from './dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	public constructor(private readonly usersService: UsersService) {}

	@ApiOperation({
		summary: 'Fetch All Users',
		description: 'Fetch a list of all users from the system.'
	})
	@ApiOkResponse({
		type: [UserResponse]
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization(UserRole.ADMIN)
	@Get()
	@HttpCode(HttpStatus.OK)
	public async findAll() {
		return this.usersService.findAll()
	}

	@ApiOperation({
		summary: 'Update User Details',
		description: 'Update the current user display name.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Patch('@me')
	@HttpCode(HttpStatus.OK)
	public async patchUser(
		@Authorized() user: User,
		@Body() dto: PatchUserRequest
	) {
		return this.usersService.patchUser(user, dto)
	}

	@ApiOperation({
		summary: 'Change user avatar',
		description: 'Update the user avatar by uploading a new image.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@ApiHeader({
		name: 'X-Session-Token',
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
