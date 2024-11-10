import { Module } from '@nestjs/common'

import { SwaggerController } from './swagger.controller'
import { SwaggerService } from './swagger.service'

@Module({
	controllers: [SwaggerController],
	providers: [SwaggerService]
})
export class SwaggerModule {}
