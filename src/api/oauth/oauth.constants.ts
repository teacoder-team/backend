import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

import { BaseService } from './base/base.service'

export const OAuthOptionsSymbol = Symbol()

export type OAuthOptions = {
	baseUrl: string
	services: BaseService[]
}

export type OAuthAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<OAuthOptions>, 'useFactory' | 'inject'>
