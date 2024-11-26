import { Allow, IsBoolean, IsOptional, IsString } from 'class-validator'

export class SwaggerDto {
	@IsString()
	title!: string

	@IsString()
	description!: string

	@IsString()
	version!: string

	@IsString()
	path!: string

	@IsBoolean()
	enabled = false

	@Allow()
	@IsOptional()
	contact?: ContactDto

	@Allow()
	@IsOptional()
	servers?: ServerDto[]
}

export class ServerDto {
	@IsString()
	url!: string

	@IsString()
	description!: string
}

export class ContactDto {
	@IsString()
	name!: string

	@IsString()
	email!: string

	@IsString()
	site!: string
}
