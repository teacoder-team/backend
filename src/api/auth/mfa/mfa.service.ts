import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { TotpStatus, type User } from '@prisma/generated'
import { verify } from 'argon2'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { TotpDisableRequest, TotpEnableRequest } from './dto'

@Injectable()
export class MfaService {
	public constructor(private readonly prismaService: PrismaService) {}

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

	private generateRecovery(): string[] {
		const recoveryCodes = Array.from({ length: 12 }, () => {
			const code = randomBytes(5).toString('hex')

			return `${code.slice(0, 5)}-${code.slice(5)}`
		})

		return recoveryCodes
	}
}
