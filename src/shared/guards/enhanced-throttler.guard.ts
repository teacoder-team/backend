import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import {
	ThrottlerException,
	ThrottlerGuard,
	type ThrottlerRequest
} from '@nestjs/throttler'
import type { Request } from 'express'

import { IS_DEV_ENV } from '../utils'

@Injectable()
export class EnhancedThrottlerGuard extends ThrottlerGuard {
	private readonly logger = new Logger(EnhancedThrottlerGuard.name)

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		if (context.getType() !== 'http') return true

		return super.canActivate(context)
	}

	protected async getTracker(req: Request): Promise<string> {
		const ip = IS_DEV_ENV
			? '5.188.62.76'
			: Array.isArray(req.headers['cf-connecting-ip'])
				? req.headers['cf-connecting-ip'][0]
				: req.headers['cf-connecting-ip'] ||
					(typeof req.headers['x-forwarded-for'] === 'string'
						? req.headers['x-forwarded-for'].split(',')[0]
						: req.ip)

		return ip
	}

	protected async handleRequest(
		requestProps: ThrottlerRequest
	): Promise<boolean> {
		const { context, limit, ttl } = requestProps

		const request = context.switchToHttp().getRequest() as Request

		const tracker = await this.getTracker(request)

		const isAllowed = await super.handleRequest(requestProps)

		if (!isAllowed) {
			this.logger.warn(
				`Throttling triggered! IP: ${tracker}, limit: ${limit}, ttl: ${ttl}s`
			)

			throw new ThrottlerException(
				`Too many requests from your IP (${tracker}). Chill the fuck out and try again in ${ttl} seconds.`
			)
		}

		return true
	}
}
