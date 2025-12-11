import { Module } from '@nestjs/common'

import { DatabaseModule } from './database/database.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'

@Module({
	imports: [DatabaseModule, PrismaModule, RedisModule]
})
export class InfraModule {}
