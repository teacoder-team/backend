import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Put
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'

import { AccountService } from './account.service'
import {
	AccountResponse,
	ChangeEmailRequest,
	ChangePasswordRequest,
	ConfirmDeletionRequest,
	CreateUserRequest,
	CreateUserResponse,
	PasswordResetRequest,
	SendPasswordResetRequest
} from './dto'

@ApiTags('Account')
@Controller('auth/account')
export class AccountController {
	public constructor(private readonly accountService: AccountService) {}

	@ApiOperation({
		summary: 'Fetch account',
		description: 'Fetch account information from the current session.'
	})
	@ApiOkResponse({
		type: AccountResponse
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async me(@Authorized() user: User) {
		return this.accountService.me(user)
	}

	@ApiOperation({
		summary: 'Create Account',
		description: 'Create a new account'
	})
	@ApiOkResponse({
		type: CreateUserResponse
	})
	@Turnstile()
	@Post('create')
	@HttpCode(HttpStatus.OK)
	public async create(
		@Body() dto: CreateUserRequest,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		return this.accountService.create(dto, ip, userAgent)
	}

	@ApiOperation({
		summary: 'Send Password Reset',
		description: 'Send an email to reset account password.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Turnstile()
	@Post('reset_password')
	@HttpCode(HttpStatus.OK)
	public async sendPasswordReset(@Body() dto: SendPasswordResetRequest) {
		return this.accountService.sendPasswordReset(dto)
	}

	@ApiOperation({
		summary: 'Password Reset',
		description: 'Confirm password reset and change the password.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Turnstile()
	@Patch('reset_password')
	@HttpCode(HttpStatus.OK)
	public async passwordReset(@Body() dto: PasswordResetRequest) {
		return this.accountService.passwordReset(dto)
	}

	@ApiOperation({
		summary: 'Change Email',
		description: 'Change the associated account email.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization()
	@Patch('change/email')
	@HttpCode(HttpStatus.OK)
	public async changeEmail(
		@Authorized() user: User,
		@Body() dto: ChangeEmailRequest
	) {
		return this.accountService.changeEmail(user, dto)
	}

	@ApiOperation({
		summary: 'Change Password',
		description: 'Change the current account password.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization()
	@Patch('change/password')
	@HttpCode(HttpStatus.OK)
	public async changePassword(
		@Authorized() user: User,
		@Body() dto: ChangePasswordRequest
	) {
		return this.accountService.changePassword(user, dto)
	}

	@ApiOperation({
		summary: 'Delete Account',
		description: 'Request to have an account deleted.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization()
	@Post('delete')
	@HttpCode(HttpStatus.OK)
	public async deleteAccount(@Authorized() user: User) {
		return this.accountService.deleteAccount(user)
	}

	@ApiOperation({
		summary: 'Confirm Account Deletion',
		description:
			'Schedule an account for deletion by confirming the received token.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization()
	@Put('delete')
	@HttpCode(HttpStatus.OK)
	public async confirmDeletion(
		@Authorized() user: User,
		@Body() dto: ConfirmDeletionRequest
	) {
		return this.accountService.confirmDeletion(user, dto)
	}
}
