import { applyDecorators, UseGuards } from '@nestjs/common'

import { PremiumGuard, SessionAuthGuard } from '../guards'

export function PremiumOnly() {
	return applyDecorators(UseGuards(SessionAuthGuard, PremiumGuard))
}
