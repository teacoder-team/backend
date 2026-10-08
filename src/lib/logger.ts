import { createLogger } from '@teacoder/logger'

import { env, isDevelopment } from '~/config/env'

export const logger = createLogger({ level: env.LOG_LEVEL, pretty: isDevelopment })

export { extendLogContext, logContext } from '@teacoder/logger'
