import { IsString } from 'class-validator'

export class StorageValidator {
	@IsString()
	public STORAGE_URL: string

	@IsString()
	public STORAGE_API_KEY: string
}
