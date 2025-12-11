import { ApiProperty } from '@nestjs/swagger'

export class CreateCourseResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: 'd364587c-b690-43c5-8a7f-3c391eee5b97'
	})
	public id: string
}
