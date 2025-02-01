import {
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

import { MfaService } from './mfa.service'

@ApiTags('MFA')
@Controller('auth/mfa')
export class MfaController {
	public constructor(private readonly mfaService: MfaService) {}

	@ApiOperation({
		summary: 'Create MFA ticket​',
		description: 'Create a new MFA ticket or validate an existing one.'
	})
	@Put('ticket')
	@HttpCode(HttpStatus.OK)
	public async createTicket() {}

	@ApiOperation({
		summary: 'MFA Status​​',
		description: 'Fetch MFA status of an account.'
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async fetchStatus() {}

	@ApiOperation({
		summary: 'Fetch Recovery Codes​​​',
		description: 'Fetch recovery codes for an account.'
	})
	@Authorization()
	@Post('recovery')
	@HttpCode(HttpStatus.OK)
	public async fetchRecovery(@Authorized() user: User) {
		return this.mfaService.fetchRecovery(user)
	}

	@ApiOperation({
		summary: 'Generate Recovery Codes​​',
		description: 'Re-generate recovery codes for an account.'
	})
	@Authorization()
	@Patch('recovery')
	@HttpCode(HttpStatus.OK)
	public async generateRecovery(@Authorized() user: User) {
		return this.mfaService.generateRecovery(user)
	}

	@ApiOperation({
		summary: 'Enable TOTP 2FA​​',
		description: 'Enable TOTP 2FA for an account.'
	})
	@Put('totp')
	@HttpCode(HttpStatus.OK)
	public async totpEnable() {}

	@ApiOperation({
		summary: 'Generate TOTP Secret​​​',
		description: 'Generate a new secret for TOTP.'
	})
	@Post('totp')
	@HttpCode(HttpStatus.OK)
	public async totpGenerateSecret() {}

	@ApiOperation({
		summary: 'Disable TOTP 2FA​​',
		description: 'Disable TOTP 2FA for an account.'
	})
	@Delete('totp')
	@HttpCode(HttpStatus.OK)
	public async totpDisable() {}
}
