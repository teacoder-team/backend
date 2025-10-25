import { IsString } from 'class-validator'

export class SentinelValidator {
	@IsString()
	public HOSTS_REST: string

	@IsString()
	public GOOGLE_CLIENT_ID: string

	@IsString()
	public GOOGLE_CLIENT_SECRET: string

	@IsString()
	public GITHUB_CLIENT_ID: string

	@IsString()
	public GITHUB_CLIENT_SECRET: string

	@IsString()
	public DISCORD_CLIENT_ID: string

	@IsString()
	public DISCORD_CLIENT_SECRET: string
}
