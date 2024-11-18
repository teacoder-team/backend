import { Module } from '@nestjs/common'

import { RedisService } from '@/core/redis/redis.service'
import { SessionSerializer } from '@/shared/serializers/session.serializer'

import { SessionController } from './session.controller'
import { SessionService } from './session.service'

@Module({
	controllers: [SessionController],
	providers: [SessionService, SessionSerializer, RedisService]
})
export class SessionModule {}
