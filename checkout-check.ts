import { db } from './src/lib/db'
import { withLock } from './src/lib/lock'
import { redis } from './src/lib/redis'
import { findReusableCheckout } from './src/modules/billing/checkout'
import { createPayment } from './src/modules/billing/service'

const course = await db.course.findFirst({ where: { price: { not: null }, isPublished: true } })

if (!course) {
	throw new Error('No priced published course in the dev database')
}

const user = await db.user.create({
	data: { username: `checkout-test-${Date.now()}`, displayName: 'Checkout Test', status: 'ACTIVE' }
})

const intent = (data: Record<string, unknown>) =>
	db.paymentIntent.create({
		data: {
			userId: user.id,
			courseId: course.id,
			amount: Number(course.price),
			currency: 'RUB',
			method: 'BANK_CARD',
			provider: 'YOOKASSA',
			pspPayload: { url: 'https://pay.example/checkout' },
			...data
		} as never
	})

const attempt = async (label: string, run: () => Promise<{ paymentId: string }>) => {
	try {
		const result = await run()

		console.log(`${label.padEnd(44)} -> 200 paymentId=${result.paymentId.slice(0, 8)}`)

		return result
	} catch (err) {
		const e = err as { statusCode?: number; message: string }

		console.log(`${label.padEnd(44)} -> ${e.statusCode ?? 'ERR'} ${e.message}`)
	}
}

try {
	const open = await intent({})

	await attempt('1. same method, open invoice', () =>
		createPayment(user.id, { method: 'BANK_CARD', courseId: course.id })
	).then((r) => console.log(`   reused the open one: ${r?.paymentId === open.id}`))

	await attempt('2. other method while it is open', () =>
		createPayment(user.id, { method: 'HELEKET', courseId: course.id })
	)

	await db.paymentIntent.update({
		where: { id: open.id },
		data: { createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
	})

	const afterTtl = await findReusableCheckout({
		userId: user.id,
		method: 'HELEKET',
		courseId: course.id
	})

	const expired = await db.paymentIntent.findUnique({ where: { id: open.id } })

	console.log(
		`3. open invoice older than 1h                -> reusable=${afterTtl} status=${expired?.status} code=${expired?.failureCode}`
	)

	const processing = await intent({ status: 'PROCESSING', method: 'HELEKET', provider: 'HELEKET' })

	await attempt('4. crypto payment still processing', () =>
		createPayment(user.id, { method: 'BANK_CARD', courseId: course.id })
	)

	await db.paymentIntent.delete({ where: { id: processing.id } })

	const keyed = await intent({ idempotencyKey: 'test-key-1' })

	await attempt('5. same Idempotency-Key, same params', () =>
		createPayment(user.id, { method: 'BANK_CARD', courseId: course.id }, 'test-key-1')
	).then((r) => console.log(`   replayed the keyed one: ${r?.paymentId === keyed.id}`))

	await attempt('6. same Idempotency-Key, other method', () =>
		createPayment(user.id, { method: 'HELEKET', courseId: course.id }, 'test-key-1')
	)

	await withLock(`checkout:${user.id}:${course.id}`, 5000, () =>
		attempt('7. concurrent request holds the lock', () =>
			createPayment(user.id, { method: 'BANK_CARD', courseId: course.id })
		)
	)

	await db.coursePurchase.create({
		data: { userId: user.id, courseId: course.id, pricePaid: 1, currency: 'RUB' }
	})

	await attempt('8. course already purchased', () =>
		createPayment(user.id, { method: 'BANK_CARD', courseId: course.id })
	)

	console.log(`9. lock released after use                    -> ${(await redis.exists(`checkout:${user.id}:${course.id}`)) === 0}`)
} finally {
	await db.user.delete({ where: { id: user.id } })
	console.log('cleanup: test user and its intents/purchases deleted')
	process.exit(0)
}
