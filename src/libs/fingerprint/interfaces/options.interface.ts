import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const FingerprintOptionsSymbol = Symbol('FINGERPRINT_OPTIONS')

export type FingerprintOptions = {
	apiKey: string
}

export type FingerprintAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<FingerprintOptions>, 'useFactory' | 'inject'>
