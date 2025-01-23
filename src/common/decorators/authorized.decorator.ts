import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import type { Account } from '@/api/auth/account/entities'

export const Authorized = createParamDecorator(
	(data: keyof Account, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		const user = request.user

		return data ? user[data] : user
	}
)
