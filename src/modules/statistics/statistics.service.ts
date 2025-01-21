import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/core/prisma/prisma.service'

@Injectable()
export class StatisticsService {
	public constructor(private readonly prismaService: PrismaService) {}
}
