import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	AccountProvider,
	EmailVerificationStatus,
	type User
} from '@prisma/generated'
import { AllowedProvider, SentinelService } from '@teacoder/sentinel'
import { createHash, createHmac, randomBytes } from 'crypto'

import { TeamanagerBotService } from '@/api/bots/teamanager/teamanager.bot.service'
import { AllConfigs } from '@/config/definitions'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'
import { slugify } from '@/shared/utils'

import { TelegramAuthRequest } from './dto'

@Injectable()
export class SsoService {
	private readonly TELEGRAM_BOT_ID: string
	private readonly TELEGRAM_BOT_TOKEN: string

	private readonly providerMap: Record<string, AccountProvider> = {
		google: AccountProvider.GOOGLE,
		github: AccountProvider.GITHUB,
		discord: AccountProvider.DISCORD,
		telegram: AccountProvider.TELEGRAM,
		yandex: AccountProvider.YANDEX
	}

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService<AllConfigs>,
		private readonly sentinelService: SentinelService,
		private readonly botService: TeamanagerBotService
	) {
		this.TELEGRAM_BOT_TOKEN = this.configService.get(
			'telegram.teacoderToken',
			{ infer: true }
		)
		this.TELEGRAM_BOT_ID = this.TELEGRAM_BOT_TOKEN.split(':')[0]
	}

	public async getAvailableMethods() {
		return ['google', 'github', 'discord', 'telegram']
	}

	public async fetchStatus(user: User) {
		const accounts = await this.prismaService.externalAccount.findMany({
			where: {
				userId: user.id
			}
		})

		const status = {
			google: accounts.some(
				account => account.provider === AccountProvider.GOOGLE
			),
			github: accounts.some(
				account => account.provider === AccountProvider.GITHUB
			),
			discord: accounts.some(
				account => account.provider === AccountProvider.DISCORD
			),
			telegram: accounts.some(
				account => account.provider === AccountProvider.TELEGRAM
			)
		}

		return status
	}

	public async connect(
		provider: AllowedProvider,
		code: string,
		userId: string
	) {
		const external = await this.sentinelService
			.findService(provider)
			.getUserByCode(code)
		const providerEnum = this.providerMap[provider]

		const existing = await this.prismaService.externalAccount.findUnique({
			where: {
				providerAccountId: external.id
			}
		})

		if (existing) {
			throw new ConflictException(
				'Этот аккаунт уже привязан к другому пользователю'
			)
		}

		const sameEmailAccount =
			await this.prismaService.externalAccount.findFirst({
				where: {
					provider: providerEnum,
					user: {
						email: external.email
					}
				}
			})

		if (sameEmailAccount) {
			throw new ConflictException(
				`Аккаунт с этой почтой уже привязан через ${provider}`
			)
		}

		await this.prismaService.externalAccount.create({
			data: {
				provider: providerEnum,
				providerAccountId: external.id,
				refreshToken: external.refreshToken,
				accessToken: external.accessToken,
				expiry: external.expiry,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		return true
	}

	public async login(
		provider: AllowedProvider,
		code: string,
		ip: string,
		userAgent: string,
		options?: { visitorId?: string; requestId?: string }
	) {
		const external = await this.sentinelService
			.findService(provider)
			.getUserByCode(code)
		const providerEnum = this.providerMap[provider]

		const account = await this.prismaService.externalAccount.findUnique({
			where: {
				providerAccountId: external.id
			},
			include: {
				user: true
			}
		})

		let user: User | null = account?.user ?? null
		let isNewUser = false

		if (!user) {
			user = await this.prismaService.user.findUnique({
				where: {
					email: external.email
				}
			})

			if (user) {
				const alreadyLinked =
					await this.prismaService.externalAccount.findFirst({
						where: {
							provider: providerEnum,
							userId: user.id
						}
					})

				if (!alreadyLinked) {
					await this.prismaService.externalAccount.create({
						data: {
							provider: providerEnum,
							providerAccountId: external.id,
							refreshToken: external.refreshToken,
							accessToken: external.accessToken,
							expiry: external.expiry,
							user: {
								connect: {
									id: user.id
								}
							}
						}
					})
				}
			} else {
				const token = randomBytes(64).toString('hex')

				user = await this.prismaService.user.create({
					data: {
						displayName: external.name,
						username: slugify(`${external.email}-${external.name}`),
						email: external.email,
						avatar: external.avatar,
						emailVerification: {
							create: {
								status: EmailVerificationStatus.VERIFIED,
								token,
								expiry: null
							}
						},
						externalAccounts: {
							create: {
								provider: providerEnum,
								providerAccountId: external.id,
								refreshToken: external.refreshToken,
								accessToken: external.accessToken,
								expiry: external.expiry
							}
						}
					}
				})

				isNewUser = true
			}
		}

		const session = await this.redisService.createSession(user, {
			ip,
			userAgent,
			visitorId: options?.visitorId,
			requestId: options?.requestId
		})

		if (isNewUser) {
			const userSession = await this.redisService.getUserSession(
				session.id
			)

			await this.botService.sendNewUser(user, userSession)
		}

		return session
	}

	public getTelegramAuthUrl(action: 'login' | 'connect') {
		const url = new URL('https://oauth.telegram.org/auth')

		url.searchParams.append('bot_id', this.TELEGRAM_BOT_ID)
		url.searchParams.append('origin', 'https://teacoder.ru')
		url.searchParams.append('embed', '1')
		url.searchParams.append('request_access', 'write')
		url.searchParams.append(
			'return_to',
			action === 'connect'
				? 'https://teacoder.ru/account/connections'
				: 'https://teacoder.ru/auth/telegram-oauth-finish'
		)

		return url.href
	}

	public async loginWithTelegram(
		dto: TelegramAuthRequest,
		ip: string,
		userAgent: string
	) {
		const { id, first_name, username, photo_url, visitorId, requestId } =
			dto

		let account = await this.prismaService.externalAccount.findUnique({
			where: {
				providerAccountId: id.toString()
			},
			include: {
				user: true
			}
		})

		let user: User | null = account?.user ?? null
		let isNewUser = false

		if (!user) {
			user = await this.prismaService.user.create({
				data: {
					displayName: first_name,
					username: username
						? `${randomBytes(16).toString('hex')}_${username}`
						: randomBytes(16).toString('hex'),
					avatar: photo_url,
					externalAccounts: {
						create: {
							provider: AccountProvider.TELEGRAM,
							providerAccountId: id.toString()
						}
					}
				}
			})
			isNewUser = true
		}

		const session = await this.redisService.createSession(user, {
			ip,
			userAgent,
			visitorId,
			requestId
		})

		if (isNewUser) await this.botService.sendNewUser(user, session)

		return session
	}

	public async connectWithTelegram(dto: TelegramAuthRequest, user: User) {
		const { id } = dto

		const existing = await this.prismaService.externalAccount.findUnique({
			where: {
				providerAccountId: id.toString()
			}
		})

		if (existing)
			throw new ConflictException('Этот Telegram аккаунт уже привязан')

		await this.prismaService.externalAccount.create({
			data: {
				provider: AccountProvider.TELEGRAM,
				providerAccountId: id.toString(),
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

		return true
	}

	public validateTelegramUser(dto: TelegramAuthRequest): boolean {
		const hash = dto.hash

		if (!hash) return false

		const now = Math.floor(Date.now() / 1000)
		const maxAge = 15 * 60

		if (Math.abs(now - dto.auth_date) > maxAge) return false

		const dataCheckArr = Object.keys(dto)
			.filter(k => k !== 'hash' && k !== 'visitorId' && k !== 'requestId')
			.sort()
			.map(k => `${k}=${dto[k]}`)

		const dataCheckString = dataCheckArr.join('\n')

		const secretKey = createHash('sha256')
			.update(this.TELEGRAM_BOT_TOKEN)
			.digest()

		const hmac = createHmac('sha256', secretKey)
			.update(dataCheckString)
			.digest('hex')

		return hmac === hash
	}

	public async unlink(provider: AllowedProvider, user: User) {
		const account = await this.prismaService.externalAccount.findUnique({
			where: {
				userId_provider: {
					userId: user.id,
					provider: this.providerMap[provider]
				}
			}
		})

		if (!account) throw new NotFoundException('External account not found')

		await this.prismaService.externalAccount.delete({
			where: {
				userId_provider: {
					userId: user.id,
					provider: this.providerMap[provider]
				}
			}
		})

		return true
	}
}
