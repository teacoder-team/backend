import { t } from 'elysia'

/** Geo and user-agent parsing can genuinely fail — `null` says so honestly. */
const Detected = (examples: string[]) => t.Nullable(t.String({ examples }))

export const SessionResponse = t.Object({
	id: t.String({
		description: 'Unique identifier of the session.',
		examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d'],
	}),
	ip: t.String({ examples: ['104.28.225.185'] }),
	country: Detected(['Россия']),
	city: Detected(['Москва']),
	browser: Detected(['Chrome']),
	os: Detected(['Windows']),
	device: Detected(['iPhone']),
	current: t.Boolean({
		description: 'Whether this is the session making the request.',
	}),
	lastSeenAt: t.String({
		description: 'When this session last made a request.',
		examples: ['2026-07-04T14:16:54.000Z'],
	}),
	createdAt: t.String({ examples: ['2026-07-04T14:16:54.000Z'] }),
})

export const SessionListResponse = t.Array(SessionResponse)

export const RevokeResponse = t.Object({
	revoked: t.Number({
		description: 'How many sessions were terminated.',
		examples: [1],
	}),
})

export const SessionParams = t.Object({
	id: t.String({ description: 'Session identifier to revoke.' }),
})
