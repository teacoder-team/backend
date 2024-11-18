import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { User } from '@prisma/generated'

import { PrismaService } from '@/core/prisma/prisma.service'

@Injectable()
export class SessionSerializer extends PassportSerializer {
	public constructor(private readonly prismaService: PrismaService) {
		super()
	}

	public serializeUser(
		user: User,
		done: (err: Error, user: any) => void
	): void {
		done(null, user.id)
	}

	public async deserializeUser(id: string, done: Function): Promise<void> {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: id
			}
		})

		if (!user) {
			return done(
				`Не удалось десериализовать пользователя с id ${id}`,
				null
			)
		}

		done(null, user)
	}
}
