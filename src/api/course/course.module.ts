import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from '../auth/account/entities'

import { CourseController } from './course.controller'
import { CourseService } from './course.service'
import { Course } from './entities'

@Module({
	imports: [TypeOrmModule.forFeature([Account, Course])],
	controllers: [CourseController],
	providers: [CourseService]
})
export class CourseModule {}
