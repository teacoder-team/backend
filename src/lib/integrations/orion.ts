import { createOrionClient, type OrionTag } from '@teacoder/orion'

import { env } from '~/config/env'
import { logger } from '~/lib/logger'

export const orion = createOrionClient({
	baseUrl: env.ORION_API_URL,
	masterKey: env.ORION_MASTER_KEY,
	logger
})

export const orionUrl = (tag: OrionTag, value: string | null) =>
	value ? orion.resolveUrl(tag, value) : null
