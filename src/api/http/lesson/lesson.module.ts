import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getKinescopeConfig } from '@/config'
import { KinescopeModule } from '@/libs/kinescope/kinescope.module'

import { LessonController } from './lesson.controller'
import { LessonService } from './lesson.service'

@Module({
	imports: [
		KinescopeModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getKinescopeConfig,
			inject: [ConfigService]
		})
	],
	controllers: [LessonController],
	providers: [LessonService]
})
export class LessonModule {}
