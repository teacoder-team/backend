import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'

import { StorageService } from './storage.service'

@Global()
@Module({
	imports: [HttpModule.register({})],
	providers: [StorageService],
	exports: [StorageService]
})
export class StorageModule {}
