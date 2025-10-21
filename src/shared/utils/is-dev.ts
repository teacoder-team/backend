import { ConfigService } from '@nestjs/config'
import * as dotenv from 'dotenv'

import type { AllConfigs } from '@/config/definitions'
import { Environment } from '@/config/validators'

dotenv.config()

export const isDev = (configService: ConfigService<AllConfigs>) =>
	configService.get('app.nodeEnv', { infer: true }) ===
	Environment.Development

export const IS_DEV_ENV = process.env.NODE_ENV === Environment.Development
