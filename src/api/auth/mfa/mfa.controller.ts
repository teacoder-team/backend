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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import {
	MfaStatusResponse,
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
	@ApiResponse({
		status: HttpStatus.OK,
		type: MfaStatusResponse
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
	@ApiResponse({
		status: HttpStatus.OK,
		type: [String]
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
	@ApiResponse({
		status: HttpStatus.OK,
		type: [String]
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
	@ApiResponse({
		status: HttpStatus.OK,
		type: Boolean
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
	@ApiResponse({
		status: HttpStatus.OK,
		type: TotpGenerateSecretResponse
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
	@ApiResponse({
		status: HttpStatus.OK,
		type: Boolean
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
}
