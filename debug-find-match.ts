import base64url from 'base64url'

import { PrismaClient } from './prisma/generated'

const prisma = new PrismaClient()

// Вставь сюда incoming id, который логируется в приложении
const incomingId = 'FzhzYz22pQeJugojD3y2DR1GFKCquBXEMCWHtrtjyAw'

function tryDecodeCandidates(str: string) {
	const candidates: { name: string; buf?: Buffer }[] = []

	// 1) treat as base64url
	try {
		candidates.push({
			name: 'base64url',
			buf: Buffer.from(str, 'base64url')
		})
	} catch (e) {}
	// 2) treat as base64
	try {
		candidates.push({ name: 'base64', buf: Buffer.from(str, 'base64') })
	} catch (e) {}
	// 3) treat as hex
	try {
		candidates.push({ name: 'hex', buf: Buffer.from(str, 'hex') })
	} catch (e) {}
	// 4) treat as utf8 text
	try {
		candidates.push({ name: 'utf8', buf: Buffer.from(str, 'utf8') })
	} catch (e) {}
	// 5) treat as already binary (unlikely): Buffer.from(JSON.parse maybe) - omit

	return candidates
}

async function main() {
	const passkeys = await prisma.passkey.findMany()
	console.log('Loaded', passkeys.length, 'passkeys from DB')

	const incomingCandidates = tryDecodeCandidates(incomingId)
	console.log(
		'Decoding incoming id candidates:',
		incomingCandidates.map(c => c.name)
	)

	for (const p of passkeys) {
		const stored = p.credentialId
		let storedBufs: { name: string; buf?: Buffer }[] = []
		// attempt decodings for stored value
		try {
			storedBufs.push({
				name: 'stored:base64url',
				buf: Buffer.from(stored, 'base64url')
			})
		} catch (e) {}
		try {
			storedBufs.push({
				name: 'stored:base64',
				buf: Buffer.from(stored, 'base64')
			})
		} catch (e) {}
		try {
			storedBufs.push({
				name: 'stored:hex',
				buf: Buffer.from(stored, 'hex')
			})
		} catch (e) {}
		try {
			storedBufs.push({
				name: 'stored:utf8',
				buf: Buffer.from(stored, 'utf8')
			})
		} catch (e) {}

		for (const inc of incomingCandidates) {
			if (!inc.buf) continue
			for (const st of storedBufs) {
				if (!st.buf) continue
				if (inc.buf.equals(st.buf)) {
					console.log('MATCH FOUND!')
					console.log('passkey.id:', p.id)
					console.log('stored.raw:', stored, st.name)
					console.log('incoming as:', inc.name)
					console.log('hex:', inc.buf.toString('hex'))
					process.exit(0)
				}
			}
		}

		// Доп. печать для диагностики
		try {
			console.log(
				'No match for stored id',
				p.id,
				stored,
				'-> hex(stored base64url):',
				Buffer.from(stored, 'base64url').toString('hex')
			)
		} catch (e) {
			console.log(
				'No match for stored id',
				p.id,
				stored,
				'(cannot decode base64url)'
			)
		}
	}

	console.log('No matches found for incoming id among stored passkeys.')
	process.exit(0)
}

main().catch(e => {
	console.error(e)
	process.exit(1)
})
