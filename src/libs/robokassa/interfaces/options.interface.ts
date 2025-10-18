import { FactoryProvider, ModuleMetadata } from '@nestjs/common'

import { HashAlgorithm } from '../enums'

export const RobokassaOptionsSymbol = Symbol('ROBOKASSA_OPTIONS')

export interface RobokassaOptions {
	login: string
	password1: string
	password2: string
	isTest: boolean
	algorithm: HashAlgorithm
}

export type RobokassaAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<RobokassaOptions>, 'useFactory' | 'inject'>
