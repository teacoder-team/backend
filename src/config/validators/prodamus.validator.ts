import { IsString } from 'class-validator'

export class ProdamusValidator {
	@IsString()
	public PRODAMUS_SECRET_KEY: string
}
