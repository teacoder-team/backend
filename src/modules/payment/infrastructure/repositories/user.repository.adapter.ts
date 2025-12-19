import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE_DB } from '@/infra/database/drizzle/drizzle.provider'
import { users } from '@/infra/database/drizzle/schema'

import {
	UserEntity,
	UserRepositoryPort
} from '../../domain/repositories/user.repository.port'

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
	public constructor(
		@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase
	) {}

	public async findById(id: string): Promise<UserEntity | null> {
		const [row] = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)

		if (!row) return null

		return {
			id: row.id,
			displayName: row.displayName,
			email: row.email,
			isAutoBilling: row.isAutoBilling
		}
	}

	public async enableAutoBilling(userId: string): Promise<void> {
		await this.db
			.update(users)
			.set({ isAutoBilling: true })
			.where(eq(users.id, userId))
	}
}
