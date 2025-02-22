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
		const ip = request.ip
		const body = request.body
		const headers = request.headers

		const now = Date.now()

		this.logger.log(
			`Incoming request: ${method} ${url} | IP: ${ip} | Headers: ${JSON.stringify(headers)} | Body: ${JSON.stringify(body)}`
		)

		return next.handle().pipe(
			tap(response => {
				const elapsed = Date.now() - now
				const statusCode = response.statusCode

				this.logger.log(
					`Request processed: ${method} ${url} | Status: ${statusCode} | Duration: ${elapsed}ms | Response: ${JSON.stringify(response)}`
				)
			})
		)
	}
}
