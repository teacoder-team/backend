export class AppError extends Error {
	public constructor(
		public override readonly message: string,
		public readonly statusCode: number = 400,
		public readonly details?: unknown,
	) {
		super(message)
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = this.constructor.name
	}
}

export class BadRequestError extends AppError {
	public constructor(message: string, details?: unknown) {
		super(message, 400, details)
	}
}

export class UnauthorizedError extends AppError {
	public constructor(message: string = 'Unauthorized') {
		super(message, 401)
	}
}

export class ForbiddenError extends AppError {
	public constructor(message: string = 'Forbidden') {
		super(message, 403)
	}
}

export class NotFoundError extends AppError {
	public constructor(message: string = 'Not Found') {
		super(message, 404)
	}
}

export class ConflictError extends AppError {
	public constructor(message: string) {
		super(message, 409)
	}
}

export class ValidationError extends AppError {
	public constructor(message: string, details?: unknown) {
		super(message, 422, details)
	}
}