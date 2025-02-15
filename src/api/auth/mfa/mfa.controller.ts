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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { DisableMfaDto, TotpEnableDto } from './dto'
import { MfaService } from './mfa.service'

@ApiTags('MFA')
@Controller('auth/mfa')
export class MfaController {
	public constructor(private readonly mfaService: MfaService) {}

	@ApiOperation({
		summary: 'MFA Status​​',
		description: 'Fetch MFA status of an account.'
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
	@Authorization()
	@Put('totp')
	@HttpCode(HttpStatus.OK)
	public async totpEnable(
		@Authorized() user: User,
		@Body() dto: TotpEnableDto
	) {
		return this.mfaService.totpEnable(user, dto)
	}

	@ApiOperation({
		summary: 'Generate TOTP Secret​​​',
		description: 'Generate a new secret for TOTP.'
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
	@Authorization()
	@Delete('totp')
	@HttpCode(HttpStatus.OK)
	public async totpDisable(
		@Authorized() user: User,
		@Body() dto: DisableMfaDto
	) {
		return this.mfaService.totpDisable(user, dto)
	}
}
