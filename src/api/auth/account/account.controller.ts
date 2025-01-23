import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'

import { AccountService } from './account.service'
import type {
	CreateUserDto,
	PasswordResetDto,
	SendPasswordResetDto
} from './dto'
import type { Account } from './entities'

@ApiTags('Account')
@Controller('auth/account')
export class AccountController {
	public constructor(private readonly accountService: AccountService) {}

	@ApiOperation({
		summary: 'Fetch account',
		description: 'Fetch account information from the current session.'
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetch(@Authorized() account: Account) {
		return this.accountService.fetch(account)
	}

	@ApiOperation({
		summary: 'Create Account',
		description: 'Create a new account'
	})
	@Turnstile()
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(
		@Body() dto: CreateUserDto,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		return this.accountService.create(dto, ip, userAgent)
	}

	@ApiOperation({
		summary: 'Send Password Reset',
		description: 'Send an email to reset account password.'
	})
	@Turnstile()
	@Post('reset_password')
	@HttpCode(HttpStatus.OK)
	public async sendPasswordReset(@Body() dto: SendPasswordResetDto) {
		return this.accountService.sendPasswordReset(dto)
	}

	@ApiOperation({
		summary: 'Password Reset',
		description: 'Confirm password reset and change the password.'
	})
	@Turnstile()
	@Patch('reset_password')
	@HttpCode(HttpStatus.OK)
	public async passwordReset(@Body() dto: PasswordResetDto) {
		return this.accountService.passwordReset(dto)
	}
}
