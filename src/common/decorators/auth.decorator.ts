import { applyDecorators, UseGuards } from '@nestjs/common'

import type { UserRole } from '@/api/auth/account/entities'

import { RolesGuard, SessionAuthGuard } from '../guards'

import { Roles } from './roles.decorator'

export function Authorization(...roles: UserRole[]) {
	if (roles.length > 0) {
		return applyDecorators(
			Roles(...roles),
			UseGuards(SessionAuthGuard, RolesGuard)
		)
	}

	return applyDecorators(UseGuards(SessionAuthGuard))
}
