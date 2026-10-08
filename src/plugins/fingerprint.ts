import { Elysia, t } from 'elysia'

import { resolveVisitorId } from '~/lib/integrations/fingerprint'

const FingerprintHeaders = t.Object({
	'x-fingerprint-event': t.Optional(
		t.String({
			maxLength: 128,
			description:
				'`event_id` из ответа `fp.get()` агента Fingerprint, полученный прямо перед запросом. Необязателен: без него вход работает, но устройство не запоминается.',
			examples: ['1708102555327.NLOjmg'],
			error: 'Fingerprint event id must be a string up to 128 characters'
		})
	)
})

export const fingerprint = new Elysia({ name: 'fingerprint' }).macro({
	fingerprint: {
		headers: FingerprintHeaders,
		async resolve({ headers }) {
			return { visitorId: await resolveVisitorId(headers['x-fingerprint-event']) }
		}
	}
})
