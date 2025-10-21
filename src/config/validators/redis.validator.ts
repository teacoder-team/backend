import { IsInt, IsString, Max, Min } from 'class-validator'

export class RedisValidator {
	@IsString()
	public REDIS_USER: string

	@IsString()
	public REDIS_PASSWORD: string

	@IsString()
	public REDIS_HOST: string

	@IsInt()
	@Min(1)
	@Max(65535)
	public REDIS_PORT: number
}
