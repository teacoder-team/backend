import { ApiProperty } from '@nestjs/swagger'

export class ArticleResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: 'b8f6cfd2-c850-4bb5-9876-e12bb55e3e94'
	})
	id: string

	@ApiProperty({
		description: 'The title of the article',
		example: 'How to use Prisma with NestJS'
	})
	title: string

	@ApiProperty({
		description: 'The slug of the article, used in the URL',
		example: 'how-to-use-prisma-with-nestjs'
	})
	slug: string

	@ApiProperty({
		description: 'Identifier of the article thumbnail',
		example: 'UCSOW2TFUGL34ZWCOZSAHDFU4W',
		required: false
	})
	thumbnail?: string

	@ApiProperty({
		description: 'The creation date of the article',
		example: '2025-05-09T21:09:00Z'
	})
	createdAt: Date

	@ApiProperty({
		description: 'The last update date of the article',
		example: '2025-05-09T21:09:00Z'
	})
	updatedAt: Date
}
