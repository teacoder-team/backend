import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException
} from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
	public catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()

		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const message = exception.message
		const status = exception.getStatus()

		response.status(status).json({
			message,
			status,
			path: request.url
		})
	}
}
