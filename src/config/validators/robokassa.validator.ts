import { IsString } from 'class-validator'

export class RobokassaValidator {
	@IsString()
	public ROBOKASSA_LOGIN: string

	@IsString()
	public ROBOKASSA_PASSWORD1: string

	@IsString()
	public ROBOKASSA_PASSWORD2: string
}
