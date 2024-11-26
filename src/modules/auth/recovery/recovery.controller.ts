import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req
} from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
import type { Request } from 'express'
import { TurnstileCaptcha } from 'nest-cloudflare-turnstile'

import { UserAgent } from '@/shared/decorators/user-agent.decorator'

import { NewPasswordDto } from './dto/new-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { RecoveryService } from './recovery.service'

@ApiTags('Account Recovery')
@Controller('auth/account/recovery')
export class RecoveryController {
	public constructor(private readonly recoveryService: RecoveryService) {}

	@ApiOperation({ summary: 'Запрос на сброс пароля' })
	@ApiBody({
		description: 'Тело запроса для сброса пароля',
		schema: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					format: 'email',
					example: 'user@example.com'
				}
			},
			required: ['email']
		}
	})
	@ApiOkResponse({
		description: 'Ссылка на сброс пароля успешно отправлена на почту'
	})
	@ApiNotFoundResponse({
		description: 'Пользователь с указанным email не найден'
	})
	@TurnstileCaptcha()
	@Post()
	@HttpCode(HttpStatus.OK)
	public async resetPassword(
		@Req() req: Request,
		@Body() dto: ResetPasswordDto,
		@UserAgent() userAgent: string
	) {
		return this.recoveryService.resetPassword(req, dto, userAgent)
	}

	@ApiOperation({ summary: 'Установка нового пароля' })
	@ApiBody({
		description: 'Тело запроса для установки нового пароля',
		schema: {
			type: 'object',
			properties: {
				password: {
					type: 'string',
					minLength: 8,
					example: 'NewStrongPassword123'
				},
				passwordRepeat: {
					type: 'string',
					minLength: 8,
					example: 'NewStrongPassword123'
				}
			},
			required: ['password', 'passwordRepeat']
		}
	})
	@ApiOkResponse({
		description: 'Пароль успешно обновлен'
	})
	@ApiBadRequestResponse({
		description: 'Срок действия токена истек'
	})
	@ApiNotFoundResponse({
		description: 'Токен не найден'
	})
	@Patch(':token')
	@HttpCode(HttpStatus.OK)
	public async newPassword(
		@Body() dto: NewPasswordDto,
		@Param('token') token: string
	) {
		return this.recoveryService.newPassword(dto, token)
	}
}
