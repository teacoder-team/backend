import { env } from '@/core/config/env'
import { logger } from '@/core/logger/pino'

const globalForEmail = globalThis as unknown as {
	disposableDomains: Set<string> | undefined
}

const LIST_PATH = `${import.meta.dir}/../../../resources/disposable-emails.txt`

export const initEmailProvider = async () => {
	if (globalForEmail.disposableDomains)
		return globalForEmail.disposableDomains

	try {
		const file = Bun.file(LIST_PATH)

		if (!(await file.exists())) {
			throw new Error(`Disposable domains list not found at ${LIST_PATH}`)
		}

		const text = await file.text()
		const domains = new Set(
			text
				.split('\n')
				.map((line) => line.trim().toLowerCase())
				.filter((line) => line.length > 0 && !line.startsWith('#')),
		)

		if (env.NODE_ENV !== 'production') {
			globalForEmail.disposableDomains = domains
		}

		logger.info(
			{ context: 'email_provider', count: domains.size },
			'disposable_email_list_initialized',
		)

		return domains
	} catch (err) {
		logger.error(
			{ err, context: 'email_provider' },
			'email_provider_init_failed',
		)
		return new Set<string>()
	}
}

export const isDisposableEmail = (email: string): boolean => {
	const domain = email.split('@').pop()?.toLowerCase()
	if (!domain) return false

	const list = globalForEmail.disposableDomains

	return list?.has(domain) ?? false
}

export const validateEmailSafety = async (email: string) => {
	const isDisposable = isDisposableEmail(email)
	if (isDisposable) return { valid: false, reason: 'disposable' }

	return { valid: true }
}
