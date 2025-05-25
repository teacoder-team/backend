import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { ArticleService } from './article.service'
import { ArticleResponse } from './dto'

@ApiTags('Article')
@Controller('articles')
export class ArticleController {
	public constructor(private readonly articleService: ArticleService) {}

	@ApiOperation({
		summary: 'Fetch All Articles',
		description: 'Retrieve a list of all available articles.'
	})
	@ApiOkResponse({
		type: [ArticleResponse]
	})
	@Get()
	@HttpCode(HttpStatus.OK)
	public async getAll() {
		return this.articleService.getAll()
	}

	@ApiOperation({
		summary: 'Get Article By Slug',
		description: 'Retrieve a article using its unique slug identifier.'
	})
	@ApiOkResponse({
		type: ArticleResponse
	})
	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	public async getBySlug(@Param('slug') slug: string) {
		return this.articleService.getBySlug(slug)
	}
}
