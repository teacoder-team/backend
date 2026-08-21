import { t } from 'elysia'

export const SessionResponse = t.Object({
	id: t.String({
		description: 'Unique identifier of the session.',
		examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d'],
	}),
	ip: t.String({ examples: ['104.28.225.185'] }),
	country: t.String({ examples: ['Россия'] }),
	city: t.String({ examples: ['Москва'] }),
	browser: t.String({ examples: ['Chrome'] }),
	os: t.String({ examples: ['Windows'] }),
	device: t.String({ examples: ['Desktop'] }),
	current: t.Boolean({
		description: 'Whether this is the session making the request.',
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
