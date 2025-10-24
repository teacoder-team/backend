import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test'
}

export class AppValidator {
	@IsEnum(Environment)
	public NODE_ENV: Environment

	@IsString()
	@IsOptional()
	public HTTP_HOST: string

	@IsInt()
	@Min(0)
	@Max(65535)
	@IsOptional()
	public HTTP_PORT: number

	@IsString()
	@IsOptional()
	public HTTP_CORS: string
}
