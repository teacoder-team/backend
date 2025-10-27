import { Region } from '@fingerprintjs/fingerprintjs-pro-server-api'
import { ConfigService } from '@nestjs/config'

import { FingerprintOptions } from '@/libs/fingerprint/interfaces'

import type { AllConfigs } from '../definitions'

export function getFingerprintConfig(
	configService: ConfigService<AllConfigs>
): FingerprintOptions {
	return {
		apiKey: configService.get('fingerprint.apiKey', { infer: true }),
		region: Region.EU
	}
}
