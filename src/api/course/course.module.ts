import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { CourseController } from './course.controller'
import { CourseService } from './course.service'

@Module({
	imports: [HttpModule.register({})],
	controllers: [CourseController],
	providers: [CourseService]
})
export class CourseModule {}
