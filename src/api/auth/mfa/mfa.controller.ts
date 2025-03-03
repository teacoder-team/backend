import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Put
} from '@nestjs/common'
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import {
	Authorization,
	Authorized,
	ClientIp,
	UserAgent
} from '@/common/decorators'

import { LoginSessionResponse } from '../session/dto'

import {
	MfaRecoveryRequest,
	MfaStatusResponse,
	MfaTotpRequest,
	TotpDisableRequest,
	TotpEnableRequest,
	TotpGenerateSecretResponse
} from './dto'
import { MfaService } from './mfa.service'

@ApiTags('MFA')
@Controller('auth/mfa')
export class MfaController {
	public constructor(private readonly mfaService: MfaService) {}

	@ApiOperation({
		summary: 'MFA Status​​',
		description: 'Fetch MFA status of an account.'
	})
	@ApiOkResponse({
		type: MfaStatusResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetchStatus(@Authorized() user: User) {
		return this.mfaService.fetchStatus(user)
	}

	@ApiOperation({
		summary: 'Fetch Recovery Codes​​​',
		description: 'Fetch recovery codes for an account.'
	})
	@ApiOkResponse({
		type: [String]
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Get('recovery')
	@HttpCode(HttpStatus.OK)
	public async fetchRecovery(@Authorized() user: User) {
		return this.mfaService.fetchRecovery(user)
	}

	@ApiOperation({
		summary: 'Regenerate Recovery Codes​​',
		description: 'Re-generate recovery codes for an account.'
	})
	@ApiOkResponse({
		type: [String]
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Patch('recovery')
	@HttpCode(HttpStatus.OK)
	public async regenerateRecovery(@Authorized() user: User) {
		return this.mfaService.regenerateRecovery(user)
	}

	@ApiOperation({
		summary: 'Enable TOTP 2FA​​',
		description: 'Enable TOTP 2FA for an account.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Put('totp')
	@HttpCode(HttpStatus.OK)
	public async totpEnable(
		@Authorized() user: User,
		@Body() dto: TotpEnableRequest
	) {
		return this.mfaService.totpEnable(user, dto)
	}

	@ApiOperation({
		summary: 'Generate TOTP Secret​​​',
		description: 'Generate a new secret for TOTP.'
	})
	@ApiOkResponse({
		type: TotpGenerateSecretResponse
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Post('totp')
	@HttpCode(HttpStatus.OK)
	public async totpGenerateSecret(@Authorized() user: User) {
		return this.mfaService.totpGenerateSecret(user)
	}

	@ApiOperation({
		summary: 'Disable TOTP 2FA​​',
		description: 'Disable TOTP 2FA for an account.'
	})
	@ApiOkResponse({
		type: Boolean
	})
	@ApiHeader({
		name: 'X-Session-Token',
		required: true
	})
	@Authorization()
	@Delete('totp')
	@HttpCode(HttpStatus.OK)
	public async totpDisable(
		@Authorized() user: User,
		@Body() dto: TotpDisableRequest
	) {
		return this.mfaService.totpDisable(user, dto)
	}

	@ApiOperation({
		summary: 'Verify MFA Ticket',
		description:
			'Verify the MFA ticket for the authenticated user, either by TOTP code or recovery code.'
	})
	@ApiOkResponse({
		type: LoginSessionResponse
	})
	@Post('verify')
	@HttpCode(HttpStatus.OK)
	public async verify(
		@Body() dto: MfaTotpRequest | MfaRecoveryRequest,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		return this.mfaService.verify(dto, ip, userAgent)
	}
}
