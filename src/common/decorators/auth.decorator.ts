import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiHeader } from '@nestjs/swagger'
import type { UserRole } from '@prisma/generated'

import { RolesGuard } from '../guards/roles.guard'
import { SessionAuthGuard } from '../guards/session.guard'

import { Roles } from './roles.decorator'

export function Authorization(...roles: UserRole[]) {
	const decorators = [
		ApiHeader({
			name: 'X-Session-Token',
			required: true,
			description: 'Token of the currently authorized user'
		}),
		UseGuards(SessionAuthGuard)
	]

	if (roles.length > 0)
		decorators.push(Roles(...roles), UseGuards(RolesGuard))

	return applyDecorators(...decorators)
}
