import { IsString } from 'class-validator'

export class KinescopeValidator {
	@IsString()
	public KINESCOPE_AUTH_TOKEN: string

	@IsString()
	public KINESCOPE_PROJECT_ID: string
}
