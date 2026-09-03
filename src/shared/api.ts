import { t, type TSchema } from 'elysia'

export interface ApiIssue {
	code: string
	message: string
	field?: string
}

export interface ApiSuccess<T> {
	success: true
	errors: ApiIssue[]
	messages: ApiIssue[]
	result: T
}

export interface ApiFailure {
	success: false
	errors: ApiIssue[]
	messages: ApiIssue[]
	result: null
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

export const ok = <T>(result: T): ApiSuccess<T> => ({
	success: true,
	errors: [],
	messages: [],
	result,
})

export const fail = (errors: ApiIssue[]): ApiFailure => ({
	success: false,
	errors,
	messages: [],
	result: null,
})

const IssueSchema = t.Object({
	code: t.String({
		description: 'Stable machine-readable identifier for this issue.',
		examples: ['AUTH_002'],
	}),
	message: t.String({
		description: 'Human-readable explanation.',
		examples: ['Invalid email or password'],
	}),
	field: t.Optional(
		t.String({
			description: 'Input field the issue refers to, when it has one.',
			examples: ['email'],
		}),
	),
})

export const PrismaEnum = <const T extends Record<string, string>>(
	values: T,
	options?: Parameters<typeof t.UnionEnum>[1],
) => {
	const allowed = Object.values(values) as [T[keyof T], ...T[keyof T][]]

	return t.UnionEnum(allowed, {
		error: `Expected one of: ${allowed.join(', ')}`,
		...options,
	})
}

export const ApiResponse = <T extends TSchema>(result: T) =>
	t.Object({
		success: t.Literal(true),
		errors: t.Array(IssueSchema),
		messages: t.Array(IssueSchema),
		result,
	})

export const ApiErrorResponse = t.Object({
	success: t.Literal(false),
	errors: t.Array(IssueSchema),
	messages: t.Array(IssueSchema),
	result: t.Null(),
})
