import { Allow, IsBoolean, IsOptional, IsString } from 'class-validator'

export class SwaggerConfig {
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
	contact?: Contact

	@Allow()
	@IsOptional()
	servers?: Server[]
}

export class Server {
	@IsString()
	url!: string

	@IsString()
	description!: string
}

export class Contact {
	@IsString()
	name!: string

	@IsString()
	email!: string

	@IsString()
	site!: string
}
