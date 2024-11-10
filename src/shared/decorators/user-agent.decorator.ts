import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

export const UserAgent = createParamDecorator(
	(_: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()

		return request.headers['user-agent']
	}
)
