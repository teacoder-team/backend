import { HttpModule } from '@nestjs/axios'
import { type DynamicModule, Module } from '@nestjs/common'

import { FingerprintService } from './fingerprint.service'
import {
	type FingerprintAsyncOptions,
	type FingerprintOptions,
	FingerprintOptionsSymbol
} from './interfaces'

@Module({})
export class FingerprintModule {
	public static forRoot(options: FingerprintOptions): DynamicModule {
		return {
			module: FingerprintModule,
			imports: [HttpModule],
			providers: [
				{
					provide: FingerprintOptionsSymbol,
					useValue: options
				},
				FingerprintService
			],
			exports: [FingerprintService],
			global: true
		}
	}

	public static forRootAsync(
		options: FingerprintAsyncOptions
	): DynamicModule {
		return {
			module: FingerprintModule,
			imports: [HttpModule, ...(options.imports || [])],
			providers: [
				{
					provide: FingerprintOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				FingerprintService
			],
			exports: [FingerprintService],
			global: true
		}
	}
}
