export enum ErrorCode {
	EMAIL_ALREADY_EXISTS = 'AUTH_001',
	INVALID_CREDENTIALS = 'AUTH_002',
	NOT_AUTHORIZED = 'AUTH_003',
	FORBIDDEN = 'AUTH_004',
	USER_NOT_FOUND = 'AUTH_005',
	SESSION_EXPIRED = 'AUTH_006',
	SESSION_NOT_FOUND = 'AUTH_007',

	VERIFICATION_CODE_INVALID = 'AUTH_010',
	VERIFICATION_CODE_EXPIRED = 'AUTH_011',
	TOO_MANY_ATTEMPTS = 'AUTH_012',
	DISPOSABLE_EMAIL = 'AUTH_013',

	MFA_REQUIRED = 'MFA_001',
	MFA_INVALID_CODE = 'MFA_002',
	MFA_NOT_ENABLED = 'MFA_003',

	OAUTH_PROVIDER_ERROR = 'OAUTH_001',
	OAUTH_ACCOUNT_ALREADY_LINKED = 'OAUTH_002',
	OAUTH_INVALID_STATE = 'OAUTH_003',

	VALIDATION_ERROR = 'VALIDATION_001',
	INVALID_INPUT_DATA = 'VALIDATION_002',

	PAYMENT_METHOD_UNSUPPORTED = 'PAYMENT_001',
	PAYMENT_PROVIDER_ERROR = 'PAYMENT_002',

	INTERNAL_SERVER_ERROR = 'SYSTEM_001',
	NOT_FOUND = 'SYSTEM_002',
	SERVICE_UNAVAILABLE = 'SYSTEM_003',
	RATE_LIMIT_EXCEEDED = 'SYSTEM_004',
	CONFLICT = 'SYSTEM_005',
}

/**
 * Every error the API answers with carries three things: a machine-readable
 * `code` for clients to branch on, an HTTP `statusCode`, and a human-readable
 * `message`. Subclasses only pin the status and a default code.
 */
export class AppError extends Error {
	constructor(
		readonly code: ErrorCode,
		readonly statusCode: number,
		message: string,
		readonly details?: unknown,
	) {
		super(message)
		this.name = new.target.name
	}
}

export class BadRequestError extends AppError {
	constructor(
		message: string,
		code: ErrorCode = ErrorCode.INVALID_INPUT_DATA,
		details?: unknown,
	) {
		super(code, 400, message, details)
	}
}

export class UnauthorizedError extends AppError {
	constructor(
		message = 'Unauthorized',
		code: ErrorCode = ErrorCode.NOT_AUTHORIZED,
	) {
		super(code, 401, message)
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Forbidden', code: ErrorCode = ErrorCode.FORBIDDEN) {
		super(code, 403, message)
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not found', code: ErrorCode = ErrorCode.NOT_FOUND) {
		super(code, 404, message)
	}
}

export class ConflictError extends AppError {
	constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT) {
		super(code, 409, message)
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super(ErrorCode.VALIDATION_ERROR, 422, message, details)
	}
}

export class InternalError extends AppError {
	constructor(message = 'Internal server error') {
		super(ErrorCode.INTERNAL_SERVER_ERROR, 500, message)
	}
}
