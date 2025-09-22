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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { PasskeyResponse } from './dto'
import { PasskeyService } from './passkey.service'

@Controller('auth/passkey')
export class PasskeyController {
	public constructor(private readonly passkeyService: PasskeyService) {}

	@ApiOperation({
		summary: 'Fetch Passkeys',
		description:
			'Retrieve the list of registered passkeys for the authenticated user.'
	})
	@ApiOkResponse({ type: [PasskeyResponse] })
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetchPasskeys(@Authorized() user: User) {
		return this.passkeyService.fetchPasskeys(user)
	}

	@Authorization()
	@Post('register/options')
	@HttpCode(HttpStatus.OK)
	public async generateRegistrationOptions(@Authorized() user: User) {
		return this.passkeyService.generateRegistrationOptions(user)
	}

	@Authorization()
	@Post('register/verify')
	@HttpCode(HttpStatus.OK)
	public async verifyRegistration(
		@Authorized() user: User,
		@Body() body: { deviceName: string; attestationResponse: any }
	) {
		return this.passkeyService.verifyRegistration(
			user,
			body.deviceName,
			body.attestationResponse
		)
	}

	@Post('login/options')
	@HttpCode(HttpStatus.OK)
	public async generateAuthenticationOptions(
		@Body() dto: { userId: string }
	) {
		return this.passkeyService.generateAuthenticationOptions(dto.userId)
	}

	@ApiOperation({
		summary: 'Delete Passkey',
		description: 'Delete a registered passkey by its ID.'
	})
	@ApiOkResponse({ type: Boolean })
	@Authorization()
	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	public async delete(@Param('id') id: string, @Authorized() user: User) {
		return this.passkeyService.delete(id, user)
	}
}
