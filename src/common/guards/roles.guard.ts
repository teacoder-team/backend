import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])

		if (!roles) return true

		const request = context.switchToHttp().getRequest()
		const user = request.user

		if (!user || !roles.includes(user.role)) {
			throw new ForbiddenException(
				'You do not have permission to access this resource'
			)
		}

		return true
	}
}
