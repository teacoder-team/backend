import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name)

	public intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<any> {
		const request = context.switchToHttp().getRequest()
		const method = request.method
		const url = request.url

		const now = Date.now()
		this.logger.log(`Incoming request: ${method} ${url}`)

		return next.handle().pipe(
			tap(response => {
				const elapsed = Date.now() - now
				this.logger.log(
					`Request processed: ${method} ${url}. Duration: ${elapsed}ms`
				)
			})
		)
	}
}
