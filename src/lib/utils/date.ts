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

/** ICU writes "30 сентября 2026 г." - the trailing "г." is noise in a message. */
export const formatDate = (date: Date) => dateFormat.format(date).replace(/\s*г\.$/, '')

export const formatDateTime = (date: Date) => `${formatDate(date)}, ${timeFormat.format(date)} МСК`
