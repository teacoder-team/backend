import { HttpModule } from '@nestjs/axios'
import { type DynamicModule, Module } from '@nestjs/common'

import {
	type RobokassaAsyncOptions,
	type RobokassaOptions,
	RobokassaOptionsSymbol
} from './interfaces'
import { RobokassaService } from './robokassa.service'

@Module({})
export class RobokassaModule {
	public static forRoot(options: RobokassaOptions): DynamicModule {
		return {
			module: RobokassaModule,
			imports: [HttpModule],
			providers: [
				{
					provide: RobokassaOptionsSymbol,
					useValue: options
				},
				RobokassaService
			],
			exports: [RobokassaService],
			global: true
		}
	}

	public static forRootAsync(options: RobokassaAsyncOptions): DynamicModule {
		return {
			module: RobokassaModule,
			imports: [HttpModule, ...(options.imports || [])],
			providers: [
				{
					provide: RobokassaOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				RobokassaService
			],
			exports: [RobokassaService],
			global: true
		}
	}
}
