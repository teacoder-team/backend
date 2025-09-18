import { type DynamicModule, Module } from '@nestjs/common'

import {
	type OAuthAsyncOptions,
	type OAuthOptions,
	OAuthOptionsSymbol
} from './oauth.constants'
import { OAuthService } from './oauth.service'

@Module({})
export class OAuthModule {
	public static forRoot(options: OAuthOptions): DynamicModule {
		return {
			module: OAuthModule,
			providers: [
				{
					useValue: options.services,
					provide: OAuthOptionsSymbol
				},
				OAuthService
			],
			exports: [OAuthService]
		}
	}

	public static forRootAsync(options: OAuthAsyncOptions): DynamicModule {
		return {
			module: OAuthModule,
			imports: options.imports,
			providers: [
				{
					useFactory: options.useFactory,
					provide: OAuthOptionsSymbol,
					inject: options.inject
				},
				OAuthService
			],
			exports: [OAuthService]
		}
	}
}
