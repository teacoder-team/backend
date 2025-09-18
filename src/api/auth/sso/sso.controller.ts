import {
	BadRequestException,
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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'
import { Response } from 'express'

import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'
import { ProviderGuard } from '@/common/guards'
import { AllowedProvider } from '@/libs/oauth/interfaces'
import { OAuthService } from '@/libs/oauth/oauth.service'

import { SsoConnectResponse, SsoStatusResponse } from './dto'
import { SsoService } from './sso.service'

@ApiTags('Sso')
@Controller('auth/sso')
export class SsoController {
	public constructor(
		private readonly ssoService: SsoService,
		private readonly oauthService: OAuthService,
		private readonly configService: ConfigService
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
		summary: 'Get login URL for external provider',
		description:
			'Generates the login URL for the specified external provider (e.g., Google, GitHub).'
	})
	@ApiOkResponse({
		type: SsoConnectResponse
	})
	@Post('login/:provider')
	@HttpCode(HttpStatus.OK)
	@UseGuards(ProviderGuard)
	public async getLoginUrl(@Param('provider') provider: AllowedProvider) {
		const providerInstance = this.oauthService.findService(provider)

		const state = Buffer.from(JSON.stringify({ action: 'login' })).toString(
			'base64'
		)

		return { url: providerInstance.getAuthUrl(state) }
	}

	@ApiOperation({
		summary: 'Get connect URL for external provider',
		description:
			'Generates the connect URL to link an external account to the current user.'
	})
	@ApiOkResponse({
		type: SsoConnectResponse
	})
	@Authorization()
	@Post('connect/:provider')
	@HttpCode(HttpStatus.OK)
	@UseGuards(ProviderGuard)
	public async getConnectUrl(
		@Param('provider') provider: AllowedProvider,
		@Authorized() user: User
	) {
		const providerInstance = this.oauthService.findService(provider)

		const state = Buffer.from(
			JSON.stringify({ action: 'connect', userId: user.id })
		).toString('base64')

		return { url: providerInstance.getAuthUrl(state) }
	}

	@ApiOperation({
		summary: 'Callback from external provider',
		description:
			'Handles the callback from an external provider after login or connect action.'
	})
	@UseGuards(ProviderGuard)
	@Get('callback/:provider')
	@HttpCode(HttpStatus.OK)
	public async callback(
		@Query('code') code: string,
		@Query('state') state: string,
		@Param('provider') provider: AllowedProvider,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string,
		@Res() res: Response
	) {
		if (!code) throw new BadRequestException('No code provided')

		const siteUrl = this.configService.getOrThrow<string>('HOSTS_APP')

		const parsedState = state
			? JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
			: null

		let result

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
					userAgent
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
		summary: 'Unlink External Account',
		description:
			'Unlink an external account (e.g., Google, GitHub) from the current user.'
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
