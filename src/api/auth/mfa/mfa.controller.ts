import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { MfaService } from './mfa.service'

@ApiTags('MFA')
@Controller('auth/mfa')
export class MfaController {
	public constructor(private readonly mfaService: MfaService) {}
}
