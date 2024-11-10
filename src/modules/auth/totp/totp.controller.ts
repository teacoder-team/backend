import {
	Body,
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	Post,
	Put
} from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { EnableTotpDto } from './dto/enable-totp.dto'
import { EnableTotpEntity } from './entities/enable-totp.entity'
import { TotpService } from './totp.service'

@ApiTags('TOTP')
@Controller('auth/totp')
export class TotpController {
	public constructor(private readonly totpService: TotpService) {}

	@ApiOperation({ summary: 'Включение двухфакторной аутентификации' })
	@ApiOkResponse({
		status: 200,
		description: 'Двухфакторная аутентификация включена',
		type: EnableTotpEntity
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Неверный код подтверждения'
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Некорректные данные для изменения пароля'
	})
	@Authorization()
	@Put('enable')
	@HttpCode(HttpStatus.OK)
	public async enable(@Authorized() user: User, @Body() dto: EnableTotpDto) {
		return this.totpService.enable(user, dto)
	}

	@ApiOperation({
		summary: 'Генерация секретного ключа для двухфакторной аутентификации'
	})
	@ApiOkResponse({
		status: 200,
		description: 'Секрет для TOTP сгенерирован',
		type: Object
	})
	@Authorization()
	@Post('generate')
	@HttpCode(HttpStatus.OK)
	public async generateSecret(@Authorized() user: User) {
		return this.totpService.generateSecret(user)
	}

	@ApiOperation({ summary: 'Отключение двухфакторной аутентификации' })
	@ApiOkResponse({
		status: 200,
		description: 'Двухфакторная аутентификация отключена'
	})
	@Authorization()
	@Delete('disable')
	@HttpCode(HttpStatus.OK)
	public async disable(@Authorized() user: User) {
		return this.totpService.disable(user)
	}
}
