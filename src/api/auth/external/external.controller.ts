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
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
import type { User } from '@prisma/generated'
import { Response } from 'express'

import { AllowedProvider } from '@/api/oauth/interfaces'
import { OAuthService } from '@/api/oauth/oauth.service'
import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'
import { ProviderGuard } from '@/common/guards'

import { ExternalConnectResponse, ExternalStatusResponse } from './dto'
import { ExternalService } from './external.service'

@ApiTags('External')
@Controller('auth/external')
export class ExternalController {
	public constructor(
		private readonly externalService: ExternalService,
		private readonly oauthService: OAuthService
	) {}

	@ApiOperation({
		summary: 'External Accounts Status',
		description:
			'Returns the status of external accounts (e.g., Google, GitHub) linked to the current user.'
	})
	@ApiOkResponse({
		type: ExternalStatusResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetchStatus(@Authorized() user: User) {
		return this.externalService.fetchStatus(user)
	}

	// @ApiOperation({
	// 	summary: 'Get OAuth Authorization URL',
	// 	description:
	// 		'Returns the URL for authorization via an external provider (e.g., Google, GitHub).'
	// })
	// @ApiOkResponse({
	// 	type: ExternalConnectResponse
	// })
	// @UseGuards(ProviderGuard)
	// @Post(':provider')
	// @HttpCode(HttpStatus.OK)
	// public async connect(@Param('provider') provider: AllowedProvider) {
	// 	const providerInstance = this.oauthService.findService(provider)

	// 	return {
	// 		url: providerInstance.getAuthUrl()
	// 	}
	// }

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

	@Get('callback/:provider')
	@UseGuards(ProviderGuard)
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

		const parsedState = state
			? JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
			: null

		let result

		if (parsedState.action === 'connect' && parsedState.userId) {
			result = await this.externalService.connect(
				provider,
				code,
				parsedState.userId
			)

			return res.redirect('http://localhost:14701/account/integrations')
		} else if (parsedState.action === 'login') {
			result = await this.externalService.login(
				provider,
				code,
				ip,
				userAgent
			)

			return res.redirect(
				`http://localhost:14701/auth/callback?token=${result.token}`
			)
		} else {
			throw new BadRequestException('Unknown action in state')
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
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@UseGuards(ProviderGuard)
	@Delete(':provider')
	@HttpCode(HttpStatus.OK)
	public async unlink(
		@Param('provider') provider: AllowedProvider,
		@Authorized() user: User
	) {
		return this.externalService.unlink(provider, user)
	}
}
