import { HttpModule } from '@nestjs/axios'
import { type DynamicModule, Module } from '@nestjs/common'

import {
	type KinescopeAsyncOptions,
	type KinescopeOptions,
	KinescopeOptionsSymbol
} from '@/common/interfaces'

import { KinescopeService } from './kinescope.service'

@Module({})
export class KinescopeModule {
	public static forRoot(options: KinescopeOptions): DynamicModule {
		return {
			module: KinescopeModule,
			imports: [HttpModule],
			providers: [
				{
					provide: KinescopeOptionsSymbol,
					useValue: options
				},
				KinescopeService
			],
			exports: [KinescopeService],
			global: true
		}
	}

	public static forRootAsync(options: KinescopeAsyncOptions): DynamicModule {
		return {
			module: KinescopeModule,
			imports: [HttpModule, ...(options.imports || [])],
			providers: [
				{
					provide: KinescopeOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				KinescopeService
			],
			exports: [KinescopeService],
			global: true
		}
	}
}
