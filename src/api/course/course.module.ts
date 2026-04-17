import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { CourseController } from './course.controller'
import { CourseRepository } from './course.repository'
import { CourseService } from './course.service'

@Module({
	imports: [HttpModule.register({})],
	controllers: [CourseController],
	providers: [CourseService, CourseRepository]
})
export class CourseModule {}
