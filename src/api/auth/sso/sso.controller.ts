import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	Res,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'
import { AllowedProvider, SentinelService } from '@teacoder/sentinel'
import type { Response } from 'express'

import { AllConfigs } from '@/config/definitions'
import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/shared/decorators'
import { ProviderGuard } from '@/shared/guards'

import {
	SsoConnectResponse,
	SsoLoginRequest,
	SsoLoginResponse,
	SsoStatusResponse,
	TelegramAuthRequest,
	TelegramAuthResponse
} from './dto'
import { SsoService } from './sso.service'

@ApiTags('Sso')
@Controller('auth/sso')
export class SsoController {
	public constructor(
		private readonly ssoService: SsoService,
		private readonly sentinelService: SentinelService,
		private readonly configService: ConfigService<AllConfigs>
	) {}

	@ApiOperation({
		summary: 'External Accounts Status',
		description:
			'Returns the status of external accounts (e.g., Google, GitHub) linked to the current user.'
	})
	@ApiOkResponse({
		type: SsoStatusResponse
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetchStatus(@Authorized() user: User) {
		return this.ssoService.fetchStatus(user)
	}

	@ApiOperation({
		summary: 'Get available SSO providers',
		description:
			'Returns a list of available external authentication providers (e.g., Google, GitHub, Discord, Telegram, Yandex, Gitlab).'
	})
	@ApiOkResponse({
		schema: {
			type: 'array',
			items: { type: 'string', example: 'google' }
		}
	})
	@Get('available')
	@HttpCode(HttpStatus.OK)
	public async getAvailableMethods() {
		return await this.ssoService.getAvailableMethods()
	}

	@ApiOperation({
		summary: 'Get login URL for external provider',
		description:
			'Generates the login URL for the specified external provider (e.g., Google, GitHub).'
	})
	@ApiParam({
		name: 'provider',
		description: 'The external provider (google, github, etc.)',
		required: true,
		schema: { type: 'string' }
	})
	@ApiOkResponse({
		type: SsoLoginResponse
	})
	@Post('login/:provider')
	@HttpCode(HttpStatus.OK)
	@UseGuards(ProviderGuard)
	public async getLoginUrl(
		@Param('provider') provider: string,
		@Body() dto: SsoLoginRequest
	) {
		const providerInstance = this.sentinelService.findService(provider)

		const state = Buffer.from(
			JSON.stringify({
				action: 'login',
				visitorId: dto.visitorId,
				requestId: dto.requestId
			})
		).toString('base64')

		return {
			url:
				provider === 'telegram'
					? this.ssoService.getTelegramAuthUrl('login')
					: providerInstance.getAuthUrl(state)
		}
	}

	@ApiOperation({
		summary: 'Get connect URL for external provider',
		description:
			'Generates the connect URL to link an external account to the current user.'
	})
	@ApiParam({
		name: 'provider',
		description: 'The external provider (google, github, etc.)',
		required: true,
		schema: { type: 'string' }
	})
	@ApiOkResponse({
		type: SsoConnectResponse
	})
	@Authorization()
	@Post('connect/:provider')
	@HttpCode(HttpStatus.OK)
	@UseGuards(ProviderGuard)
	public async getConnectUrl(
		@Param('provider') provider: string,
		@Authorized() user: User
	) {
		const providerInstance = this.sentinelService.findService(provider)

		const state = Buffer.from(
			JSON.stringify({ action: 'connect', userId: user.id })
		).toString('base64')

		return {
			url:
				provider === 'telegram'
					? this.ssoService.getTelegramAuthUrl('connect')
					: providerInstance.getAuthUrl(state)
		}
	}

	@ApiOperation({
		summary: 'Callback from external provider',
		description:
			'Handles the callback from an external provider after login or connect action.'
	})
	@ApiParam({
		name: 'provider',
		description: 'The external provider (google, github, etc.)',
		required: true,
		schema: { type: 'string' }
	})
	@UseGuards(ProviderGuard)
	@Get('callback/:provider')
	@HttpCode(HttpStatus.OK)
	public async callback(
		@Query('code') code: string,
		@Query('error') error: string,
		@Query('state') state: string,
		@Param('provider') provider: AllowedProvider,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string,
		@Res() res: Response
	) {
		const siteUrl = this.configService.get('hosts.app', { infer: true })

		if (error) {
			const parsedState = state
				? JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
				: null

			if (parsedState?.action === 'connect') {
				return res.redirect(
					`${siteUrl}/account/connections?error=${error}`
				)
			} else if (parsedState?.action === 'login') {
				return res.redirect(`${siteUrl}/auth/login?error=${error}`)
			} else {
				return res.redirect(`${siteUrl}?error=${error}`)
			}
		}

		if (!code) throw new BadRequestException('No code provided')

		const parsedState = state
			? JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
			: null

		try {
			if (parsedState.action === 'connect' && parsedState.userId) {
				await this.ssoService.connect(
					provider,
					code,
					parsedState.userId
				)

				return res.redirect(`${siteUrl}/account/connections`)
			} else if (parsedState.action === 'login') {
				const result = await this.ssoService.login(
					provider,
					code,
					ip,
					userAgent,
					{
						visitorId: parsedState.visitorId,
						requestId: parsedState.requestId
					}
				)

				return res.redirect(
					`${siteUrl}/auth/callback#token=${result.token}`
				)
			} else {
				throw new BadRequestException('Unknown action in state')
			}
		} catch (error) {
			const message = error?.message ?? 'unknown'

			let errorCode = 'unknown'

			if (message.includes('уже привязан')) errorCode = 'already-linked'
			else if (message.includes('почтой')) errorCode = 'email-taken'

			if (parsedState.action === 'connect') {
				return res.redirect(
					`${siteUrl}/account/connections?error=${errorCode}`
				)
			}
		}
	}

	@ApiOperation({
		summary: 'Telegram OAuth Callback',
		description:
			'Handles the callback from Telegram login. Validates the Telegram data and creates a session for the user.'
	})
	@ApiOkResponse({
		type: TelegramAuthResponse
	})
	@Post('callback/telegram')
	@HttpCode(HttpStatus.OK)
	public async telegramCallback(
		@Body() dto: TelegramAuthRequest,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		const isValid = this.ssoService.validateTelegramUser(dto)

		if (!isValid) throw new BadRequestException('Invalid Telegram data')

		return await this.ssoService.loginWithTelegram(dto, ip, userAgent)
	}

	@ApiOperation({
		summary: 'Telegram Connect Callback',
		description:
			'Handles Telegram OAuth result and links Telegram account to the current user.'
	})
	@Authorization()
	@Post('telegram/connect-callback')
	@HttpCode(HttpStatus.OK)
	public async telegramConnectCallback(
		@Body() dto: TelegramAuthRequest,
		@Authorized() user: User
	) {
		const isValid = this.ssoService.validateTelegramUser(dto)

		if (!isValid) throw new BadRequestException('Invalid Telegram data')

		return this.ssoService.connectWithTelegram(dto, user)
	}

	@ApiOperation({
		summary: 'Unlink External Account',
		description:
			'Unlink an external account (e.g., Google, GitHub) from the current user.'
	})
	@ApiParam({
		name: 'provider',
		description: 'The external provider (google, github, etc.)',
		required: true,
		schema: { type: 'string' }
	})
	@ApiOkResponse({
		type: Boolean
	})
	@Authorization()
	@UseGuards(ProviderGuard)
	@Delete(':provider')
	@HttpCode(HttpStatus.OK)
	public async unlink(
		@Param('provider') provider: AllowedProvider,
		@Authorized() user: User
	) {
		return this.ssoService.unlink(provider, user)
	}
}
