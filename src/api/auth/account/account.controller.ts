import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Req
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { type User } from '@prisma/generated'
import type { Request } from 'express'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import { Authorization, Authorized, UserAgent } from '@/common/decorators'

import { AccountService } from './account.service'
import {
	ChangePasswordDto,
	CreateUserDto,
	PasswordResetDto,
	SendPasswordResetDto
} from './dto'

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
	public async fetch(@Authorized() user: User) {
		return this.accountService.fetch(user)
	}

	@ApiOperation({
		summary: 'Create Account',
		description: 'Create a new account'
	})
	@Turnstile()
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(
		@Req() req: Request,
		@Body() dto: CreateUserDto,
		@UserAgent() userAgent: string
	) {
		return this.accountService.create(req, dto, userAgent)
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

	@ApiOperation({
		summary: 'Change Password',
		description: 'Change the current account password.'
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
}
