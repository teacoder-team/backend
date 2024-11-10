/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type CreateUserDto = object

export type ChangePasswordDto = object

export type LoginDto = object

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
	/** set parameter to `true` for call `securityWorker` for this request */
	secure?: boolean
	/** request path */
	path: string
	/** content type of request body */
	type?: ContentType
	/** query params */
	query?: QueryParamsType
	/** format of response (i.e. response.json() -> format: "json") */
	format?: ResponseFormat
	/** request body */
	body?: unknown
	/** base url */
	baseUrl?: string
	/** request cancellation token */
	cancelToken?: CancelToken
}

export type RequestParams = Omit<
	FullRequestParams,
	'body' | 'method' | 'query' | 'path'
>

export interface ApiConfig<SecurityDataType = unknown> {
	baseUrl?: string
	baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
	securityWorker?: (
		securityData: SecurityDataType | null
	) => Promise<RequestParams | void> | RequestParams | void
	customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
	extends Response {
	data: D
	error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
	Json = 'application/json',
	FormData = 'multipart/form-data',
	UrlEncoded = 'application/x-www-form-urlencoded',
	Text = 'text/plain'
}

export class HttpClient<SecurityDataType = unknown> {
	public baseUrl: string = ''
	private securityData: SecurityDataType | null = null
	private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
	private abortControllers = new Map<CancelToken, AbortController>()
	private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
		fetch(...fetchParams)

	private baseApiParams: RequestParams = {
		credentials: 'same-origin',
		headers: {},
		redirect: 'follow',
		referrerPolicy: 'no-referrer'
	}

	constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
		Object.assign(this, apiConfig)
	}

	public setSecurityData = (data: SecurityDataType | null) => {
		this.securityData = data
	}

	protected encodeQueryParam(key: string, value: any) {
		const encodedKey = encodeURIComponent(key)
		return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
	}

	protected addQueryParam(query: QueryParamsType, key: string) {
		return this.encodeQueryParam(key, query[key])
	}

	protected addArrayQueryParam(query: QueryParamsType, key: string) {
		const value = query[key]
		return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
	}

	protected toQueryString(rawQuery?: QueryParamsType): string {
		const query = rawQuery || {}
		const keys = Object.keys(query).filter(
			key => 'undefined' !== typeof query[key]
		)
		return keys
			.map(key =>
				Array.isArray(query[key])
					? this.addArrayQueryParam(query, key)
					: this.addQueryParam(query, key)
			)
			.join('&')
	}

	protected addQueryParams(rawQuery?: QueryParamsType): string {
		const queryString = this.toQueryString(rawQuery)
		return queryString ? `?${queryString}` : ''
	}

	private contentFormatters: Record<ContentType, (input: any) => any> = {
		[ContentType.Json]: (input: any) =>
			input !== null &&
			(typeof input === 'object' || typeof input === 'string')
				? JSON.stringify(input)
				: input,
		[ContentType.Text]: (input: any) =>
			input !== null && typeof input !== 'string'
				? JSON.stringify(input)
				: input,
		[ContentType.FormData]: (input: any) =>
			Object.keys(input || {}).reduce((formData, key) => {
				const property = input[key]
				formData.append(
					key,
					property instanceof Blob
						? property
						: typeof property === 'object' && property !== null
							? JSON.stringify(property)
							: `${property}`
				)
				return formData
			}, new FormData()),
		[ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
	}

	protected mergeRequestParams(
		params1: RequestParams,
		params2?: RequestParams
	): RequestParams {
		return {
			...this.baseApiParams,
			...params1,
			...(params2 || {}),
			headers: {
				...(this.baseApiParams.headers || {}),
				...(params1.headers || {}),
				...((params2 && params2.headers) || {})
			}
		}
	}

	protected createAbortSignal = (
		cancelToken: CancelToken
	): AbortSignal | undefined => {
		if (this.abortControllers.has(cancelToken)) {
			const abortController = this.abortControllers.get(cancelToken)
			if (abortController) {
				return abortController.signal
			}
			return void 0
		}

		const abortController = new AbortController()
		this.abortControllers.set(cancelToken, abortController)
		return abortController.signal
	}

	public abortRequest = (cancelToken: CancelToken) => {
		const abortController = this.abortControllers.get(cancelToken)

		if (abortController) {
			abortController.abort()
			this.abortControllers.delete(cancelToken)
		}
	}

	public request = async <T = any, E = any>({
		body,
		secure,
		path,
		type,
		query,
		format,
		baseUrl,
		cancelToken,
		...params
	}: FullRequestParams): Promise<HttpResponse<T, E>> => {
		const secureParams =
			((typeof secure === 'boolean'
				? secure
				: this.baseApiParams.secure) &&
				this.securityWorker &&
				(await this.securityWorker(this.securityData))) ||
			{}
		const requestParams = this.mergeRequestParams(params, secureParams)
		const queryString = query && this.toQueryString(query)
		const payloadFormatter =
			this.contentFormatters[type || ContentType.Json]
		const responseFormat = format || requestParams.format

		return this.customFetch(
			`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
			{
				...requestParams,
				headers: {
					...(requestParams.headers || {}),
					...(type && type !== ContentType.FormData
						? { 'Content-Type': type }
						: {})
				},
				signal:
					(cancelToken
						? this.createAbortSignal(cancelToken)
						: requestParams.signal) || null,
				body:
					typeof body === 'undefined' || body === null
						? null
						: payloadFormatter(body)
			}
		).then(async response => {
			const r = response.clone() as HttpResponse<T, E>
			r.data = null as unknown as T
			r.error = null as unknown as E

			const data = !responseFormat
				? r
				: await response[responseFormat]()
						.then(data => {
							if (r.ok) {
								r.data = data
							} else {
								r.error = data
							}
							return r
						})
						.catch(e => {
							r.error = e
							return r
						})

			if (cancelToken) {
				this.abortControllers.delete(cancelToken)
			}

			if (!response.ok) throw data
			return data
		})
	}
}

/**
 * @title TeaCoder API
 * @version 1.0.0
 * @contact TeaCoder Team <help@teacoder.ru> (https://teacoder.ru)
 *
 * API for Teacoder educational platform
 */
export class Api<
	SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
	swagger = {
		/**
		 * No description
		 *
		 * @tags Swagger
		 * @name SwaggerControllerGetJson
		 * @request GET:/swagger/json
		 */
		swaggerControllerGetJson: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/swagger/json`,
				method: 'GET',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Swagger
		 * @name SwaggerControllerGetTypescript
		 * @request GET:/swagger/typescript
		 */
		swaggerControllerGetTypescript: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/swagger/typescript`,
				method: 'GET',
				...params
			})
	}
	auth = {
		/**
		 * No description
		 *
		 * @tags Account
		 * @name AccountControllerFetch
		 * @request GET:/auth/account
		 */
		accountControllerFetch: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/account`,
				method: 'GET',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Account
		 * @name AccountControllerCreate
		 * @request POST:/auth/account/create
		 */
		accountControllerCreate: (
			data: CreateUserDto,
			params: RequestParams = {}
		) =>
			this.request<void, any>({
				path: `/auth/account/create`,
				method: 'POST',
				body: data,
				type: ContentType.Json,
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Account
		 * @name AccountControllerChangePassword
		 * @request PATCH:/auth/account/change/password
		 */
		accountControllerChangePassword: (
			data: ChangePasswordDto,
			params: RequestParams = {}
		) =>
			this.request<void, any>({
				path: `/auth/account/change/password`,
				method: 'PATCH',
				body: data,
				type: ContentType.Json,
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Account
		 * @name AccountControllerChangeAvatar
		 * @request PATCH:/auth/account/change/avatar
		 */
		accountControllerChangeAvatar: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/account/change/avatar`,
				method: 'PATCH',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Session
		 * @name SessionControllerLogin
		 * @request POST:/auth/session/login
		 */
		sessionControllerLogin: (data: LoginDto, params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/session/login`,
				method: 'POST',
				body: data,
				type: ContentType.Json,
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Session
		 * @name SessionControllerLogout
		 * @request POST:/auth/session/logout
		 */
		sessionControllerLogout: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/session/logout`,
				method: 'POST',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Session
		 * @name SessionControllerFindAll
		 * @request GET:/auth/session/all
		 */
		sessionControllerFindAll: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/session/all`,
				method: 'GET',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Session
		 * @name SessionControllerRemoveAll
		 * @request DELETE:/auth/session/all
		 */
		sessionControllerRemoveAll: (params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/session/all`,
				method: 'DELETE',
				...params
			}),

		/**
		 * No description
		 *
		 * @tags Session
		 * @name SessionControllerRemoveById
		 * @request DELETE:/auth/session/by-id/{id}
		 */
		sessionControllerRemoveById: (id: string, params: RequestParams = {}) =>
			this.request<void, any>({
				path: `/auth/session/by-id/${id}`,
				method: 'DELETE',
				...params
			})
	}
}
