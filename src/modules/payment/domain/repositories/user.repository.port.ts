export interface UserEntity {
	id: string
	displayName: string
	email: string
	isAutoBilling: boolean
}

export abstract class UserRepositoryPort {
	public abstract findById(id: string): Promise<UserEntity | null>
	public abstract enableAutoBilling(userId: string): Promise<void>
}
