import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes } from 'crypto'
import { lookup } from 'geoip-country'
import Redis from 'ioredis'
import { UAParser } from 'ua-parser-js'
import { v4 as uuidv4 } from 'uuid'

import type { Account } from '@/api/auth/account/entities'
import type { Session, UserSession } from '@/common/interfaces'

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(RedisService.name)
	private parser: UAParser

	public constructor(private readonly configService: ConfigService) {
		super({
			host: configService.getOrThrow<string>('REDIS_HOST'),
			port: configService.getOrThrow<number>('REDIS_PORT'),
			username: configService.getOrThrow<string>('REDIS_USER'),
			password: configService.getOrThrow<string>('REDIS_PASSWORD')
		})

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

	public async createSession(
		account: Account,
		ip: string,
		userAgent: string
	) {
		this.parser.setUA(userAgent)
		const result = this.parser.getResult()
		const geo = lookup(ip)

		const session: Session = {
			id: uuidv4(),
			token: randomBytes(40).toString('hex'),
			userId: account.id
		}

		await this.hmset(`sessions:${session.id}`, session)
		await this.expire(`sessions:${session.id}`, 30 * 24 * 60 * 60)

		const userSession: UserSession = {
			id: uuidv4(),
			createdAt: new Date().toISOString(),
			ip,
			geo,
			ua: result.ua,
			browser: result.browser,
			cpu: result.cpu,
			device: result.device,
			engine: result.engine,
			os: result.os,
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
