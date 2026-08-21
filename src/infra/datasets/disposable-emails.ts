import { RESOURCES } from '@/config/paths'
import { lazy } from '@/shared/lazy'

const domains = lazy(async () => {
	const list = await Bun.file(RESOURCES.disposableEmails).text()

	return new Set(
		list
			.split('\n')
			.map((line) => line.trim().toLowerCase())
			.filter((line) => line.length > 0 && !line.startsWith('#')),
	)
})

/** Warmed in bootstrap so a missing list fails the start, not a request. */
export const warmDisposableEmails = domains

export const isDisposableEmail = async (email: string): Promise<boolean> => {
	const domain = email.split('@').pop()?.toLowerCase()

	return domain ? (await domains()).has(domain) : false
}
