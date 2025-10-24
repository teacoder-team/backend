import { IsString } from 'class-validator'

export class HostsValidator {
	@IsString()
	public HOSTS_REST: string

	@IsString()
	public HOSTS_APP: string
}
