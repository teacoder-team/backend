import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post
} from '@nestjs/common'
import { ApiHeader, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { User } from '@prisma/generated'

import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'

import {
	GeneratePasskeyOptionsResponse,
	PasskeyResponse,
	RegisterPasskeyRequest,
	RegisterPasskeyResponse
} from './dto'
import { PasskeyService } from './passkey.service'

@Controller('auth/passkey')
export class PasskeyController {
	public constructor(private readonly passkeyService: PasskeyService) {}

	@ApiOperation({
		summary: 'Fetch Passkeys',
		description:
			'Retrieve the list of registered passkeys for the authenticated user.'
	})
	@ApiOkResponse({
		type: [PasskeyResponse]
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetchPasskeys(@Authorized() user: User) {
		return this.passkeyService.fetchPasskeys(user)
	}

	@ApiOperation({
		summary: 'Register Passkey​​',
		description: 'Register a passkey for an account.'
	})
	@ApiOkResponse({
		type: RegisterPasskeyResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Post()
	@HttpCode(HttpStatus.OK)
	public async registerPasskey(
		@Authorized() user: User,
		@Body() dto: RegisterPasskeyRequest,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		return this.passkeyService.registerPasskey(user, dto, ip, userAgent)
	}

	@Post('login-options')
	@HttpCode(HttpStatus.OK)
	async generateLoginOptions() {
		return this.passkeyService.generateLoginOptions()
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async verifyLogin(@Body() body: { credential: any }) {
		return this.passkeyService.verifyLogin(body)
	}

	@ApiOperation({
		summary: 'Generate Registration Options',
		description:
			'Generate options required to initiate WebAuthn registration.'
	})
	@ApiOkResponse({ type: GeneratePasskeyOptionsResponse })
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Post('options')
	@HttpCode(HttpStatus.OK)
	public async generatePasskeyOptions(@Authorized() user: User) {
		return this.passkeyService.generatePasskeyOptions(user)
	}

	@ApiOperation({
		summary: 'Delete Passkey',
		description: 'Delete a registered passkey by its ID.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	public async delete(@Param('id') id: string, @Authorized() user: User) {
		return this.passkeyService.delete(id, user)
	}
}
