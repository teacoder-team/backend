import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator'

export class MailerValidator {
	@IsString()
	public MAIL_HOST: string

	@IsInt()
	@Min(1)
	@Max(65535)
	public MAIL_PORT: number

	@IsString()
	public MAIL_LOGIN: string

	@IsString()
	public MAIL_PASSWORD: string

	@IsEmail()
	public MAIL_FROM_ADDRESS: string
}
