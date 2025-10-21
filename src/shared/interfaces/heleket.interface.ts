import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const HeleketOptionsSymbol = Symbol('HELEKET_OPTIONS')

export type HeleketOptions = {
	merchant: string
	apiKey: string
}

export type HeleketAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<HeleketOptions>, 'useFactory' | 'inject'>
