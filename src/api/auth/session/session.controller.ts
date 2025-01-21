import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Req
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'
import type { Request } from 'express'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import { Authorization, Authorized, UserAgent } from '@/common/decorators'

import { LoginDto } from './dto'
import { SessionService } from './session.service'

@ApiTags('Session')
@Controller('auth/session')
export class SessionController {
	public constructor(private readonly sessionService: SessionService) {}

	@ApiOperation({ summary: 'Войти в систему' })
	@Turnstile()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Req() req: Request,
		@Body() dto: LoginDto,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(req, dto, userAgent)
	}

	@ApiOperation({ summary: 'Выйти из системы' })
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Req() req: Request) {
		return this.sessionService.logout(req)
	}

	@ApiOperation({
		summary: 'Получить все активные сессии для пользователя'
	})
	@Get('all')
	@HttpCode(HttpStatus.OK)
	@Authorization()
	public async findAll(@Req() req: Request, @Authorized() user: User) {
		return this.sessionService.findAll(req, user)
	}

	@ApiOperation({ summary: 'Получить данные текущей активной сессии' })
	@Authorization()
	@Get('current')
	@HttpCode(HttpStatus.OK)
	public async findCurrent(@Req() req: Request, @Authorized() user: User) {
		return this.sessionService.findCurrent(req, user)
	}

	@ApiOperation({ summary: 'Удалить конкретную сессию по ID' })
	@Delete('remove/:id')
	@HttpCode(HttpStatus.OK)
	public async remove(@Req() req: Request, @Param('id') id: string) {
		return this.sessionService.remove(req, id)
	}
}
