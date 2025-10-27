import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { User } from '@prisma/generated'
import { randomBytes } from 'crypto'
import * as geoip from 'geoip-lite'
import Redis from 'ioredis'
import { ipToGeolocation } from 'location-from-ip'
import { UAParser } from 'ua-parser-js'
import { v4 as uuidv4 } from 'uuid'

import { getRedisConfig } from '@/config'
import type { AllConfigs } from '@/config/definitions'
import { FingerprintService } from '@/libs/fingerprint/fingerprint.service'
import type { Session, UserSession } from '@/shared/interfaces'

export interface CreateSessionOptions {
	ip: string
	userAgent: string
	visitorId?: string | null
	requestId?: string | null
}

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(RedisService.name)
	private parser: UAParser

	public constructor(
		private readonly configService: ConfigService<AllConfigs>,
		private readonly fingerprintService: FingerprintService
	) {
		super(getRedisConfig(configService))

		this.parser = new UAParser()
	}

	public async onModuleInit() {
		this.logger.log('🔄 Initializing Redis connection...')

		this.on('connect', () => {
			this.logger.log('✅ Redis connected successfully')
		})

		this.on('error', err => {
			this.logger.error('❌ Failed to connect to Redis:', err)
		})
	}

	public async onModuleDestroy() {
		this.logger.log('🔻 Shutting down Redis connection...')

		try {
			await this.quit()
			this.logger.log('🟢 Redis connection closed successfully.')
		} catch (error) {
			this.logger.error(
				'⚠️ Error while shutting down Redis connection',
				error
			)
			throw error
		}
	}

	public async createSession(user: User, options: CreateSessionOptions) {
		const { ip: originalIp, userAgent, visitorId, requestId } = options

		let visitorHistory = null

		if (visitorId && requestId) {
			visitorHistory =
				await this.fingerprintService.getVisitorHistory(visitorId)
		}

		this.parser.setUA(userAgent ?? '')
		const uaResult = this.parser.getResult()

		const visits = Array.isArray(visitorHistory?.visits)
			? visitorHistory.visits
			: []
		const lastVisit = visits.length ? visits[0] : null

		const visitIp = originalIp ?? ''
		const visitTime = lastVisit?.time || new Date().toISOString()
		const visitRequestId = lastVisit?.requestId || requestId || null
		const visitUrl = lastVisit?.url || null

		const incognito =
			typeof lastVisit?.incognito === 'boolean'
				? lastVisit.incognito
				: undefined

		const geo = visitIp ? await ipToGeolocation(visitIp) : null

		const session: Session = {
			id: uuidv4(),
			token: randomBytes(40).toString('hex'),
			userId: user.id
		}

		await this.hmset(`sessions:${session.id}`, {
			id: session.id,
			token: session.token,
			userId: session.userId
		})
		await this.expire(`sessions:${session.id}`, 7 * 24 * 60 * 60)

		const userSession: UserSession = {
			id: uuidv4(),
			createdAt: new Date().toISOString(),
			ip: visitIp,
			geo: geo
				? {
						country: geo.country,
						region: geo.state,
						city: geo.city,
						ll: [geo.latitude, geo.longitude],
						zip: geo.zip,
						calling_code: geo.calling_code,
						continent: geo.continent,
						currency_code: geo.currency_code,
						timezone: geo.timezone,
						is_eu_member: geo.is_eu_member
					}
				: null,
			ua: uaResult.ua || null,
			browser: lastVisit?.browserDetails.browserName
				? {
						name: lastVisit?.browserDetails.browserName,
						version: lastVisit?.browserDetails.browserFullVersion
					}
				: uaResult.browser || null,
			cpu: uaResult.cpu || null,
			device: uaResult.device || null,
			engine: uaResult.engine || null,
			os: lastVisit?.browserDetails.os
				? {
						name: lastVisit?.browserDetails.os,
						version: lastVisit?.browserDetails.osVersion
					}
				: uaResult.os || null,
			fingerprint: visitorId
				? {
						visitorId,
						requestId: visitRequestId
					}
				: null,
			visit: {
				time: visitTime,
				url: visitUrl,
				incognito: incognito ?? null
			},
			sessionId: session.id
		}

		await this.set(
			`user_sessions:${session.id}`,
			JSON.stringify(userSession),
			'EX',
			7 * 24 * 60 * 60
		)

		this.logger.debug(`Created session ${session.id} for user ${user.id}`)

		return session
	}

	public async getUserSession(
		sessionId: string
	): Promise<UserSession | null> {
		try {
			const raw = await this.get(`user_sessions:${sessionId}`)

			if (!raw) {
				this.logger.warn(
					`UserSession not found for sessionId: ${sessionId}`
				)
				return null
			}

			const data: UserSession = JSON.parse(raw)

			if (!data || !data.id || !data.sessionId) {
				this.logger.warn(
					`Invalid UserSession data for sessionId: ${sessionId}`
				)
				return null
			}

			return data
		} catch (error) {
			this.logger.error(
				`Failed to get UserSession for sessionId: ${sessionId}`,
				error
			)
			throw error
		}
	}

	public async createMfaTicket(
		userId: string,
		allowedMethods: string[],
		options?: {
			visitorId?: string
			requestId?: string
			visitorHistory?: any
		}
	) {
		const data = {
			ticket: randomBytes(20).toString('hex'),
			allowedMethods,
			userId,
			visitorId: options?.visitorId ?? null,
			requestId: options?.requestId ?? null,
			visitorHistory: options?.visitorHistory ?? null
		}

		await this.hset(`mfa_tickets:${data.ticket}`, data)
		await this.expire(`mfa_tickets:${data.ticket}`, 300)

		return data
	}
}
