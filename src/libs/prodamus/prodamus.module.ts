import { HttpModule } from '@nestjs/axios'
import { type DynamicModule, Module } from '@nestjs/common'

import {
	type ProdamusAsyncOptions,
	type ProdamusOptions,
	ProdamusOptionsSymbol
} from './interfaces'
import { ProdamusService } from './prodamus.service'

@Module({})
export class ProdamusModule {
	public static forRoot(options: ProdamusOptions): DynamicModule {
		return {
			module: ProdamusModule,
			imports: [HttpModule],
			providers: [
				{
					provide: ProdamusOptionsSymbol,
					useValue: options
				},
				ProdamusService
			],
			exports: [ProdamusService],
			global: true
		}
	}

	public static forRootAsync(options: ProdamusAsyncOptions): DynamicModule {
		return {
			module: ProdamusModule,
			imports: [HttpModule, ...(options.imports || [])],
			providers: [
				{
					provide: ProdamusOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				ProdamusService
			],
			exports: [ProdamusService],
			global: true
		}
	}
}
