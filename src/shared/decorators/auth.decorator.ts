import { applyDecorators, UseGuards } from '@nestjs/common'
import type { UserRole } from '@prisma/generated'

import { RolesGuard } from '../guards/roles.guard'
import { SessionAuthGuard } from '../guards/session.guard'

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
