import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class MfaService {
	public constructor(private readonly prismaService: PrismaService) {}
}
