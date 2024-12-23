import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import type { Request } from 'express'
import { lookup } from 'geoip-country'
import Redis from 'ioredis'
import DeviceDetector from 'node-device-detector'
import { v4 as uuidv4 } from 'uuid'

import type {
	Session,
	UserSession
} from '@/shared/interfaces/session.interface.'
import { generateRandom } from '@/shared/utils/generate-random.util'
import { getIp } from '@/shared/utils/get-ip.util'

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(RedisService.name)
	private detector: DeviceDetector

	public constructor(private readonly configService: ConfigService) {
		super(configService.getOrThrow<string>('REDIS_URI'))

		this.detector = new DeviceDetector({
			clientIndexes: true,
			deviceIndexes: true,
			deviceAliasCode: false,
			deviceTrusted: false,
			deviceInfo: false,
			maxUserAgentSize: 500
		})
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

	public async createSession(user: User, req: Request, userAgent: string) {
		const result = this.detector.detect(userAgent)
		const ip = getIp(req)
		const geo = lookup(ip)

		const session: Session = {
			id: uuidv4(),
			token: generateRandom(128),
			userId: user.id
		}

		await this.hmset(`sessions:${session.id}`, session)
		await this.expire(`sessions:${session.id}`, 30 * 24 * 60 * 60)

		const userSession: UserSession = {
			id: uuidv4(),
			createdAt: new Date().toISOString(),
			ip,
			geo,
			os: result.os,
			client: result.client,
			device: result.device,
			sessionId: session.id
		}

		await this.set(
			`user_sessions:${userSession.id}`,
			JSON.stringify(userSession),
			'EX',
			30 * 24 * 60 * 60
		)

		return session
	}
}
