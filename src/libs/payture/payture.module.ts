import { HttpModule } from '@nestjs/axios'
import { DynamicModule, Global, Module } from '@nestjs/common'

import { PAYTURE_OPTIONS } from './constants'
import type { PaytureAsyncOptions, PaytureOptions } from './interfaces'
import { PaytureService } from './payture.service'
import {
	createPaytureAsyncOptionsProvider,
	createPaytureOptionsProvider
} from './providers'

@Global()
@Module({})
export class PaytureModule {
	public static register(options: PaytureOptions): DynamicModule {
		const provider = createPaytureOptionsProvider(options)

		return {
			module: PaytureModule,
			imports: [HttpModule],
			providers: [provider, PaytureService],
			exports: [PaytureService, PAYTURE_OPTIONS]
		}
	}

	public static registerAsync(options: PaytureAsyncOptions): DynamicModule {
		const provider = createPaytureAsyncOptionsProvider(options)

		return {
			module: PaytureModule,
			imports: [...(options.imports ?? []), HttpModule],
			providers: [provider, PaytureService],
			exports: [PaytureService, PAYTURE_OPTIONS]
		}
	}
}
