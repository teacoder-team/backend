import { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const ProdamusOptionsSymbol = Symbol('PRODAMUS_OPTIONS')

export interface ProdamusOptions {
	secretKey: string
}

export type ProdamusAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<ProdamusOptions>, 'useFactory' | 'inject'>
