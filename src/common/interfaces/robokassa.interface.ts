import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const RobokassaOptionsSymbol = Symbol('ROBOKASSA_OPTIONS')

export type RobokassaOptions = {
	login: string
	password: string
}

export type RobokassaAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<RobokassaOptions>, 'useFactory' | 'inject'>
