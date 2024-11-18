import { AuthModuleOptions } from '@nestjs/passport'

export function getPassportConfig(): AuthModuleOptions {
	return {
		session: true
	}
}
