import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

import type { PaytureOptions } from './payture-options.interface'

export interface PaytureAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
	useFactory: (...args: any[]) => Promise<PaytureOptions> | PaytureOptions
	inject?: FactoryProvider['inject']
}
