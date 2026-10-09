const TIME_ZONE = 'Europe/Moscow'

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
	timeZone: TIME_ZONE,
	day: 'numeric',
	month: 'long',
	year: 'numeric'
})

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
	timeZone: TIME_ZONE,
	hour: '2-digit',
	minute: '2-digit'
})

export const formatDate = (date: Date) => dateFormat.format(date).replace(/\s*г\.$/, '')

export const formatTime = (date: Date) => timeFormat.format(date)

export const formatDateTime = (date: Date) => `${formatDate(date)}, ${formatTime(date)} МСК`

export const addMonths = (date: Date, months: number) => {
	const result = new Date(date)
	const day = result.getUTCDate()

	result.setUTCDate(1)
	result.setUTCMonth(result.getUTCMonth() + months)

	const lastDay = new Date(
		Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
	).getUTCDate()

	result.setUTCDate(Math.min(day, lastDay))

	return result
}
