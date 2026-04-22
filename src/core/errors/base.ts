import { ErrorCode } from './codes'

export class AppError extends Error {
	public constructor(
		public readonly code: ErrorCode,
		public override readonly message: string,
		public readonly statusCode: number = 400,
		public readonly details?: unknown,
	) {
		super(message)
		Object.setPrototypeOf(this, new.target.prototype)
	}
}

export class BadRequestError extends AppError {
	public constructor(code: ErrorCode, message: string, details?: unknown) {
		super(code, message, 400, details)
	}
}

export class UnauthorizedError extends AppError {
	public constructor(
		code: ErrorCode = ErrorCode.NOT_AUTHORIZED,
		message: string = 'Unauthorized',
	) {
		super(code, message, 401)
	}
}

export class ForbiddenError extends AppError {
	public constructor(code: ErrorCode, message: string) {
		super(code, message, 403)
	}
}

export class NotFoundError extends AppError {
	public constructor(code: ErrorCode, message: string) {
		super(code, message, 404)
	}
}

export class ConflictError extends AppError {
	public constructor(code: ErrorCode, message: string) {
		super(code, message, 409)
	}
}

export class ValidationError extends AppError {
	public constructor(code: ErrorCode, message: string, details?: unknown) {
		super(code, message, 422, details)
	}
}
