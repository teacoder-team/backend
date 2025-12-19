import { Global, Module } from '@nestjs/common'

import { DRIZZLE_DB, drizzleProvider } from './drizzle/drizzle.provider'

@Global()
@Module({
	providers: [drizzleProvider],
	exports: [DRIZZLE_DB]
})
export class DatabaseModule {}
