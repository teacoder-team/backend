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
import type { Request } from 'express'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'

import type { Account } from '../account/entities'

import type { LoginDto } from './dto'
import { SessionService } from './session.service'

@ApiTags('Session')
@Controller('auth/session')
export class SessionController {
	public constructor(private readonly sessionService: SessionService) {}

	@ApiOperation({ summary: 'Login', description: 'Login to an account.' })
	@Turnstile()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Body() dto: LoginDto,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(dto, ip, userAgent)
	}

	@ApiOperation({
		summary: 'Logout',
		description: 'Delete current session.'
	})
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Req() req: Request) {
		return this.sessionService.logout(req)
	}

	@ApiOperation({
		summary: 'Fetch Sessions',
		description: 'Fetch all sessions associated with this account.'
	})
	@Get('all')
	@HttpCode(HttpStatus.OK)
	@Authorization()
	public async findAll(@Req() req: Request, @Authorized() account: Account) {
		return this.sessionService.findAll(req, account)
	}

	@ApiOperation({
		summary: 'Fetch Current Session',
		description: 'Fetch the details of the currently active session.'
	})
	@Authorization()
	@Get('current')
	@HttpCode(HttpStatus.OK)
	public async findCurrent(
		@Req() req: Request,
		@Authorized() account: Account
	) {
		return this.sessionService.findCurrent(req, account)
	}

	@ApiOperation({
		summary: 'Revoke Session​',
		description: 'Delete a specific active session.'
	})
	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	public async remove(@Req() req: Request, @Param('id') id: string) {
		return this.sessionService.remove(req, id)
	}
}
