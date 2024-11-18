import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'

import { AccountModule } from '@/modules/auth/account/account.module'
import { SessionModule } from '@/modules/auth/session/session.module'
import { TotpModule } from '@/modules/auth/totp/totp.module'
import { CategoryModule } from '@/modules/category/category.module'
import { CourseModule } from '@/modules/course/course.module'
import { StatisticsModule } from '@/modules/statistics/statistics.module'
import { StorageModule } from '@/modules/storage/storage.module'
import { IS_DEV_ENV } from '@/shared/utils/is-dev.util'

import { getPassportConfig } from './config/passport.config'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { SwaggerModule } from './swagger/swagger.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PassportModule.registerAsync({
			useFactory: getPassportConfig
		}),
		PrismaModule,
		RedisModule,
		SwaggerModule,
		StorageModule,
		AccountModule,
		SessionModule,
		TotpModule,
		CourseModule,
		CategoryModule,
		StatisticsModule
	]
})
export class CoreModule {}
