import type { Provider } from '@nestjs/common'

import { PAYTURE_OPTIONS } from '../constants'
import type { PaytureAsyncOptions, PaytureOptions } from '../interfaces'

export function createPaytureOptionsProvider(
	options: PaytureOptions
): Provider {
	return {
		provide: PAYTURE_OPTIONS,
		useValue: Object.freeze({ ...options })
	}
}

export function createPaytureAsyncOptionsProvider(
	options: PaytureAsyncOptions
): Provider {
	return {
		provide: PAYTURE_OPTIONS,
		useFactory: async (...args: unknown[]) => {
			const resolved = await options.useFactory!(...args)

			if (!resolved?.key || typeof resolved.key !== 'string')
				throw new Error(
					'[PaytureModule] "key" is required and must be a string'
				)

			return Object.freeze({ ...resolved })
		},
		inject: options.inject ?? []
	}
}
