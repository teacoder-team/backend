import { createNpdClient } from '@teacoder/npd'

import { env } from '~/config/env'
import { logger } from '~/lib/logger'

export const npd = createNpdClient({
	inn: env.NPD_INN,
	password: env.NPD_PASSWORD,
	deviceId: env.NPD_DEVICE_ID,
	logger
})
