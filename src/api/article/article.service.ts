import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

@Injectable()
export class ArticleService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {}

	public async getAll() {
		const articles = await this.prismaService.article.findMany({
			where: {
				isPublished: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return articles
	}

	public async getBySlug(slug: string) {
		const cached = await this.redisService.get(`articles:${slug}`)

		if (cached) return JSON.parse(cached)

		const article = await this.prismaService.article.findUnique({
			where: {
				slug,
				isPublished: true
			}
		})

		if (!article) throw new NotFoundException('Статья не найдена')

		await this.redisService.set(
			`articles:${article.slug}`,
			JSON.stringify(article),
			'EX',
			10 * 60
		)

		return article
	}
}
