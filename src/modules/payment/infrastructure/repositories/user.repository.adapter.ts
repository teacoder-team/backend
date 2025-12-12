import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DatabaseService } from '@/infra/database/database.service'
import { users } from '@/infra/database/drizzle/schema'

import {
	UserEntity,
	UserRepositoryPort
} from '../../domain/repositories/user.repository.port'

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
	public constructor(private readonly db: DatabaseService) {}

	public async findById(id: string): Promise<UserEntity | null> {
		const [row] = await this.db.db
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
		await this.db.db
			.update(users)
			.set({ isAutoBilling: true })
			.where(eq(users.id, userId))
	}
}
