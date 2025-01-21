import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const UserAgent = createParamDecorator(
	(_: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest() as Request

		return request.headers['user-agent']
	}
)
