import { Global, Module } from '@nestjs/common'

import { NpdService } from './npd.service'

@Global()
@Module({
	providers: [NpdService],
	exports: [NpdService]
})
export class NpdModule {}
