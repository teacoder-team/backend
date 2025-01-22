import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

import { IS_DEV_ENV } from '../utils'

export const UserAgent = createParamDecorator(
	(_: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest() as Request

		return request.headers['user-agent']
	}
)

export const ClientIp = createParamDecorator(
	(_: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest() as Request

		const ip = IS_DEV_ENV
			? '63.116.61.253'
			: Array.isArray(request.headers['cf-connecting-ip'])
				? request.headers['cf-connecting-ip'][0]
				: request.headers['cf-connecting-ip'] ||
					(typeof request.headers['x-forwarded-for'] === 'string'
						? request.headers['x-forwarded-for'].split(',')[0]
						: request.ip)

		return ip
	}
)
