import { createNpdClient } from '@teacoder/npd'

import { env } from '~/config/env'
import { logger } from '~/lib/logger'

/** Signs in lazily on first use - creating it costs nothing. */
export const npd = createNpdClient({
	inn: env.NPD_INN,
	password: env.NPD_PASSWORD,
	deviceId: env.NPD_DEVICE_ID,
	logger
})
