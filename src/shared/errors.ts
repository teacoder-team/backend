export class AppError extends Error {
	constructor(
		message: string,
		readonly statusCode: number = 500
	) {
		super(message)
		this.name = new.target.name
	}
}

export class BadRequestError extends AppError {
	constructor(message: string) {
		super(message, 400)
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Unauthorized') {
		super(message, 401)
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Forbidden') {
		super(message, 403)
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not found') {
		super(message, 404)
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409)
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 422)
	}
}

export class TooManyRequestsError extends AppError {
	constructor(message = 'Too many requests') {
		super(message, 429)
	}
}

export class InternalError extends AppError {
	constructor(message = 'Internal server error') {
		super(message, 500)
	}
}
