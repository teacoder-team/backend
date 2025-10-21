import { Module } from '@nestjs/common'

import { CourseInfraModule } from './infrastructure/course.module'

@Module({
	imports: [CourseInfraModule],
	exports: [CourseInfraModule]
})
export class CourseModule {}
