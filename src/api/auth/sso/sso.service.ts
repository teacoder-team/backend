import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import {
	AccountProvider,
	EmailVerificationStatus,
	type User
} from '@prisma/generated'
import { AllowedProvider, SentinelService } from '@teacoder/sentinel'
import { randomBytes } from 'crypto'

import { TeamanagerBotService } from '@/bots/teamanager/teamanager.bot.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'
import { slugify } from '@/shared/utils'

@Injectable()
export class SsoService {
	private readonly providerMap: Record<AllowedProvider, AccountProvider> = {
		google: AccountProvider.GOOGLE,
		github: AccountProvider.GITHUB,
		yandex: AccountProvider.YANDEX
	}

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly sentinelService: SentinelService,
		private readonly botService: TeamanagerBotService
	) {}

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

		const existingAccount =
			await this.prismaService.externalAccount.findUnique({
				where: {
					providerAccountId: external.id
				}
			})

		if (existingAccount) {
			throw new BadRequestException(
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
			throw new BadRequestException(
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
		userAgent: string
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

		const session = await this.redisService.createSession(
			user,
			ip,
			userAgent
		)

		if (isNewUser) {
			const userSession = await this.redisService.getUserSession(
				session.id
			)

			await this.botService.sendNewUser(user, userSession)
		}

		return session
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
