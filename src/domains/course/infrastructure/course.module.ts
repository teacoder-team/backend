import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import { CourseApplicationService } from '../application/services/course.application.service'
import { CourseController } from '../interfaces/rest/course.controller'

import { PrismaDownloadLogRepository } from './download-log.prisma.repository'
import { PrismaCourseRepository } from './prisma-course.repository'

@Module({
	imports: [HttpModule.register({}), ConfigModule],
	controllers: [CourseController],
	providers: [
		CourseApplicationService,
		{
			provide: 'CourseRepository',
			useClass: PrismaCourseRepository
		},
		{
			provide: 'DownloadLogRepository',
			useClass: PrismaDownloadLogRepository
		},
		PrismaService,
		RedisService
	],
	exports: [CourseApplicationService]
})
export class CourseInfraModule {}
