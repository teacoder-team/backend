import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RestrictionStatus, User } from '@prisma/generated'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { MailService } from '@/libs/mail/mail.service'

import type { CreateRestrictionRequest } from './dto'

@Injectable()
export class RestrictionService {
	private readonly logger = new Logger(RestrictionService.name)

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}

	public async getActiveRestriction(user: User) {
		const restriction = await this.prismaService.restriction.findFirst({
			where: {
				userId: user.id,
				status: RestrictionStatus.ACTIVE
			},
			select: {
				id: true,
				createdAt: true,
				reason: true,
				until: true
			}
		})

		if (!restriction) return null

		const remainingTime = restriction.until
			? new Date(restriction.until).toLocaleDateString('ru-RU', {
					timeZone: 'UTC'
				})
			: 'Бессрочно'

		return {
			createdAt: restriction.createdAt,
			reason: restriction.reason,
			until: remainingTime,
			isPermanent: !restriction.until
		}
	}

	public async create(dto: CreateRestrictionRequest) {
		const { reason, until, userId } = dto

		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId
			}
		})

		if (!user) throw new NotFoundException('User not found')

		const violations = await this.getViolationsCount(user.id)

		const isThirdBan = violations >= 2
		const restrictionUntil = isThirdBan ? undefined : until

		const activeRestriction =
			await this.prismaService.restriction.findFirst({
				where: {
					userId: user.id,
					status: RestrictionStatus.ACTIVE
				}
			})

		if (activeRestriction)
			throw new ConflictException(
				'User already has an active restriction'
			)

		const restriction = await this.prismaService.restriction.create({
			data: {
				reason,
				until: restrictionUntil,
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

		await this.mailService.sendRestrictionEmail(
			user,
			restriction,
			violations
		)

		return true
	}

	public async cancel(userId: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId
			}
		})

		if (!user) throw new NotFoundException('User not found')

		const restriction = await this.prismaService.restriction.findFirst({
			where: {
				userId: user.id,
				status: RestrictionStatus.ACTIVE
			}
		})

		if (!restriction)
			throw new NotFoundException(
				'No active restriction found for this user'
			)

		await this.prismaService.restriction.update({
			where: {
				id: restriction.id
			},
			data: {
				status: RestrictionStatus.CANCELED
			}
		})

		const violations = await this.getViolationsCount(user.id)

		await this.mailService.sendRestrictionLiftedEmail(user, violations)

		return true
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	public async expireRestrictionsDaily() {
		this.logger.log('🕛 Starting daily expiration of restrictions...')

		const restrictions = await this.prismaService.restriction.findMany({
			where: {
				status: RestrictionStatus.ACTIVE,
				until: {
					lte: new Date()
				}
			},
			include: {
				user: true
			}
		})

		if (!restrictions.length) {
			this.logger.log('❌ No active restrictions to expire today')
		} else {
			this.logger.log(
				`✅ Found ${restrictions.length} active restrictions to expire`
			)

			for (const restriction of restrictions) {
				this.logger.log(
					`🔄 Expiring restriction for user: ${restriction.user.id}`
				)

				await this.prismaService.restriction.update({
					where: {
						id: restriction.id
					},
					data: {
						status: RestrictionStatus.EXPIRED
					}
				})

				const violations = await this.getViolationsCount(
					restriction.user.id
				)

				await this.mailService.sendRestrictionLiftedEmail(
					restriction.user,
					violations
				)

				this.logger.log(
					`✅ Restriction expired for user: ${restriction.user.id}`
				)
			}
		}

		this.logger.log('✔️ Daily expiration of restrictions completed')
	}

	private async getViolationsCount(userId: string) {
		const violations = await this.prismaService.restriction.count({
			where: {
				userId,
				status: {
					in: [RestrictionStatus.EXPIRED, RestrictionStatus.CANCELED]
				}
			}
		})

		return violations
	}
}
