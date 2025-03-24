import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name)

	public intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<any> {
		const request = context.switchToHttp().getRequest() as Request

		const method = request.method
		const url = request.url
		const body = request.body

		const now = Date.now()

		this.logger.log(
			`Incoming request: ${method} ${url} | Body: ${JSON.stringify(body)}`
		)

		return next.handle().pipe(
			tap(() => {
				const elapsed = Date.now() - now

				this.logger.log(
					`Request processed: ${method} ${url} | Duration: ${elapsed}ms`
				)
			})
		)
	}
}
