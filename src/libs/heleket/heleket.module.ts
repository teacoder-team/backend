import { HttpModule } from '@nestjs/axios'
import { type DynamicModule, Module } from '@nestjs/common'

import {
	type HeleketAsyncOptions,
	type HeleketOptions,
	HeleketOptionsSymbol
} from '@/common/interfaces'

import { HeleketService } from './heleket.service'

@Module({})
export class HeleketModule {
	public static forRoot(options: HeleketOptions): DynamicModule {
		return {
			module: HeleketModule,
			imports: [HttpModule],
			providers: [
				{
					provide: HeleketOptionsSymbol,
					useValue: options
				},
				HeleketService
			],
			exports: [HeleketService],
			global: true
		}
	}

	public static forRootAsync(options: HeleketAsyncOptions): DynamicModule {
		return {
			module: HeleketModule,
			imports: [HttpModule, ...(options.imports || [])],
			providers: [
				{
					provide: HeleketOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				HeleketService
			],
			exports: [HeleketService],
			global: true
		}
	}
}
