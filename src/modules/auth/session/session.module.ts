import { Module } from '@nestjs/common'

import { RedisService } from '@/core/redis/redis.service'

import { SessionController } from './session.controller'
import { SessionService } from './session.service'

@Module({
	controllers: [SessionController],
	providers: [SessionService, RedisService]
})
export class SessionModule {}
