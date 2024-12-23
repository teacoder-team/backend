import type { Request } from 'express'

import { IS_DEV_ENV } from './is-dev.util'

export function getIp(req: Request): string {
	const ip = IS_DEV_ENV
		? '63.116.61.253'
		: Array.isArray(req.headers['cf-connecting-ip'])
			? req.headers['cf-connecting-ip'][0]
			: req.headers['cf-connecting-ip'] ||
				(typeof req.headers['x-forwarded-for'] === 'string'
					? req.headers['x-forwarded-for'].split(',')[0]
					: req.ip)

	return ip
}
