import { db } from '@/core/database'
import type { Prisma, User } from '@prisma/generated/client'

export const authRepository = {
	async findByEmail(email: string): Promise<User | null> {
		return db.user.findUnique({
			where: { email },
		})
	},
	async create(data: Prisma.UserCreateInput): Promise<User> {
		return db.user.create({
			data,
		})
	},
	async exists(email: string): Promise<boolean> {
		const count = await db.user.count({
			where: { email },
		})

		return count > 0
	},
}
