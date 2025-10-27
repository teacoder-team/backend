import type { Region } from '@fingerprintjs/fingerprintjs-pro-server-api'
import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const FingerprintOptionsSymbol = Symbol('FINGERPRINT_OPTIONS')

export type FingerprintOptions = {
	apiKey: string
	region: Region
}

export type FingerprintAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<FingerprintOptions>, 'useFactory' | 'inject'>
