import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { TotpStatus, type User } from '@prisma/generated'
import { verify } from 'argon2'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import {
	MfaRecoveryRequest,
	MfaTotpRequest,
	TotpDisableRequest,
	TotpEnableRequest
} from './dto'

@Injectable()
export class MfaService {
	public constructor(
		private readonly prismaService: PrismaService,
		protected readonly redisService: RedisService
	) {}

	public async fetchStatus(user: User) {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				},
				include: {
					totp: true,
					passkey: true
				}
			})

		return {
			totpMfa: mfa?.totp?.status === TotpStatus.ENABLED,
			passkeyMfa: mfa?.passkey?.isActivated || false,
			recoveryActive: mfa?.recoveryCodes.length > 0
		}
	}

	public async fetchRecovery(user: User): Promise<string[]> {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				}
			})

		if (!mfa) {
			throw new NotFoundException(
				'Многофакторная аутентификация не включена для этого пользователя'
			)
		}

		return mfa.recoveryCodes
	}

	public async regenerateRecovery(user: User): Promise<string[]> {
		const recoveryCodes = this.generateRecovery()

		const mfa = await this.prismaService.multiFactorAuthentication.update({
			where: {
				userId: user.id
			},
			data: {
				recoveryCodes
			}
		})

		return mfa.recoveryCodes
	}

	public async totpEnable(user: User, dto: TotpEnableRequest) {
		const { secret, pin } = dto

		const totp = new TOTP({
			issuer: 'TeaCoder',
			label: `${user.email}`,
			algorithm: 'SHA1',
			digits: 6,
			secret
		})

		const delta = totp.validate({ token: pin })

		if (delta === null) {
			throw new BadRequestException('Неверный код')
		}

		let mfa = await this.prismaService.multiFactorAuthentication.findUnique(
			{
				where: {
					userId: user.id
				}
			}
		)

		if (!mfa.recoveryCodes || mfa.recoveryCodes.length === 0) {
			const recoveryCodes = this.generateRecovery()

			await this.prismaService.multiFactorAuthentication.update({
				where: {
					userId: user.id
				},
				data: {
					recoveryCodes
				}
			})
		}

		await this.prismaService.totp.update({
			where: {
				id: mfa.totpId
			},
			data: {
				status: TotpStatus.ENABLED
			}
		})

		return true
	}

	public async totpGenerateSecret(user: User) {
		let mfa = await this.prismaService.multiFactorAuthentication.findUnique(
			{
				where: {
					userId: user.id
				},
				include: {
					totp: true
				}
			}
		)

		if (!mfa) {
			mfa = await this.prismaService.multiFactorAuthentication.create({
				data: {
					userId: user.id
				},
				include: {
					totp: true
				}
			})
		}

		const secret = encode(randomBytes(15))
			.replace(/=/g, '')
			.substring(0, 24)

		const totp = new TOTP({
			issuer: 'TeaCoder',
			label: `${user.email}`,
			algorithm: 'SHA1',
			digits: 6,
			secret
		})

		const otpauthUrl = totp.toString()
		const qrCodeUrl = await QRCode.toDataURL(otpauthUrl)

		if (mfa.totp) {
			await this.prismaService.totp.update({
				where: {
					id: mfa.totp.id
				},
				data: {
					secret,
					status: TotpStatus.PENDING
				}
			})
		} else {
			await this.prismaService.totp.create({
				data: {
					secret,
					status: TotpStatus.PENDING,
					mfa: {
						connect: {
							id: mfa.id
						}
					}
				}
			})
		}

		return { qrCodeUrl, secret }
	}

	public async totpDisable(user: User, dto: TotpDisableRequest) {
		const { password } = dto

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new BadRequestException('Неверный пароль')
		}

		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				},
				include: {
					totp: true,
					passkey: true
				}
			})

		if (
			!mfa?.totpId ||
			!mfa.totp ||
			mfa.totp.status !== TotpStatus.ENABLED
		) {
			throw new NotFoundException('У вас не включён TOTP')
		}

		await this.prismaService.totp.update({
			where: {
				id: mfa.totpId
			},
			data: {
				secret: null,
				status: TotpStatus.DISABLED
			}
		})

		const hasPasskey = mfa.passkey?.isActivated

		if (!hasPasskey) {
			await this.prismaService.multiFactorAuthentication.update({
				where: {
					userId: user.id
				},
				data: {
					recoveryCodes: []
				}
			})
		}

		return true
	}

	public async verify(
		dto: MfaTotpRequest | MfaRecoveryRequest,
		ip: string,
		userAgent: string
	) {
		const ticket = await this.redisService.hgetall(
			`mfa_tickets:${dto.ticket}`
		)

		if (!ticket || !ticket.userId)
			throw new BadRequestException('Неверный или истекший MFA билет')

		const user = await this.prismaService.user.findUnique({
			where: {
				id: ticket.userId
			}
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		if ('totpCode' in dto) {
			if (!ticket.allowedMethods.includes('Totp')) {
				throw new BadRequestException('Метод TOTP не разрешен')
			}

			await this.verifyTotpCode(user, dto.totpCode)
		} else if ('recoveryCode' in dto) {
			if (!ticket.allowedMethods.includes('Recovery')) {
				throw new BadRequestException(
					'Метод восстановления не разрешен'
				)
			}

			await this.verifyRecoveryCode(user, dto.recoveryCode)
		}

		const session = await this.redisService.createSession(
			user,
			ip,
			userAgent
		)

		await this.redisService.del(`mfa_tickets:${dto.ticket}`)

		return session
	}

	private async verifyTotpCode(
		user: User,
		totpCode: string
	): Promise<boolean> {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				},
				include: {
					totp: true
				}
			})

		if (!mfa || !mfa.totp || mfa.totp.status !== TotpStatus.ENABLED)
			throw new NotFoundException('TOTP не активирован')

		const totp = new TOTP({
			issuer: 'TeaCoder',
			label: `${user.email}`,
			algorithm: 'SHA1',
			digits: 6,
			secret: mfa.totp.secret
		})

		const isValid = totp.validate({ token: totpCode }) !== null

		if (!isValid) throw new UnauthorizedException('Неверный код')

		return true
	}

	private async verifyRecoveryCode(
		user: User,
		recoveryCode: string
	): Promise<boolean> {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				}
			})

		if (
			!mfa ||
			!mfa.recoveryCodes ||
			!mfa.recoveryCodes.includes(recoveryCode)
		)
			throw new UnauthorizedException('Неверный код восстановления')

		return true
	}

	private generateRecovery(): string[] {
		const recoveryCodes = Array.from({ length: 12 }, () => {
			const code = randomBytes(5).toString('hex')

			return `${code.slice(0, 5)}-${code.slice(5)}`
		})

		return recoveryCodes
	}
}
