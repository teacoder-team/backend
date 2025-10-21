import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TotpStatus, type User } from '@prisma/generated'
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server'
import base64url from 'base64url'
import { randomBytes } from 'crypto'

import type { AllConfigs } from '@/config/definitions'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

@Injectable()
export class PasskeyService {
	private readonly WEBAUTHN_RP_NAME: string
	private readonly WEBAUTHN_RP_ID: string
	private readonly WEBAUTHN_ORIGIN: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService<AllConfigs>
	) {
		this.WEBAUTHN_RP_NAME = this.configService.get('webauthn.rpName', {
			infer: true
		})
		this.WEBAUTHN_RP_ID = this.configService.get('webauthn.rpId', {
			infer: true
		})
		this.WEBAUTHN_ORIGIN = this.configService.get('webauthn.origin', {
			infer: true
		})
	}

	public async fetchPasskeys(user: User) {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: { userId: user.id },
				include: {
					passkeys: {
						select: {
							id: true,
							deviceName: true,
							lastUsedAt: true,
							createdAt: true
						}
					}
				}
			})

		if (!mfa || !mfa.passkeys) {
			throw new NotFoundException(
				'Многофакторная аутентификация не включена'
			)
		}

		return mfa.passkeys
	}

	public async generateRegistrationOptions(user: User) {
		let mfa = await this.prismaService.multiFactorAuthentication.findUnique(
			{
				where: {
					userId: user.id
				},
				include: {
					passkeys: true
				}
			}
		)

		if (!mfa) {
			mfa = await this.prismaService.multiFactorAuthentication.create({
				data: {
					userId: user.id
				},
				include: {
					passkeys: true
				}
			})
		}

		const options = await generateRegistrationOptions({
			rpName: this.WEBAUTHN_RP_NAME,
			rpID: this.WEBAUTHN_RP_ID,
			userID: new TextEncoder().encode(user.id),
			userDisplayName: user.displayName,
			userName: user.email,
			attestationType: 'none',
			excludeCredentials: mfa?.passkeys.map(pk => ({
				id: base64url.encode(Buffer.from(pk.credentialId, 'base64')),
				type: 'public-key'
			})),
			authenticatorSelection: {
				residentKey: 'discouraged',
				userVerification: 'preferred'
			}
		})

		await this.prismaService.multiFactorAuthentication.update({
			where: {
				userId: user.id
			},
			data: {
				currentChallenge: options.challenge
			}
		})

		return options
	}

	public async verifyRegistration(
		user: User,
		deviceName: string,
		attestationResponse: any,
		userAgent: string,
		ip: string
	) {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				}
			})

		if (!mfa?.currentChallenge)
			throw new BadRequestException('No challenge found')

		const verification = await verifyRegistrationResponse({
			response: attestationResponse,
			expectedChallenge: mfa.currentChallenge,
			expectedOrigin: this.WEBAUTHN_ORIGIN,
			expectedRPID: this.WEBAUTHN_RP_ID
		})

		if (!verification.verified)
			throw new BadRequestException('Verification failed')

		const {
			credential: { id, publicKey }
		} = verification.registrationInfo

		await this.prismaService.passkey.create({
			data: {
				deviceName,
				credentialId: id,
				publicKey: publicKey.toString(),
				userAgent,
				ip,
				lastUsedAt: new Date(),
				mfa: {
					connect: {
						userId: user.id
					}
				}
			}
		})

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

		return true
	}

	public async generateAuthenticationOptions(userId: string) {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId
				},
				include: {
					passkeys: true
				}
			})

		if (!mfa || !mfa.passkeys.length)
			throw new NotFoundException('Нет зарегистрированных ключей доступа')

		const options = await generateAuthenticationOptions({
			rpID: this.WEBAUTHN_RP_ID,
			userVerification: 'preferred',
			allowCredentials: mfa.passkeys.map(pk => ({
				id: pk.credentialId,
				type: 'public-key'
			}))
		})

		await this.redisService.set(
			`passkey_challenge:${userId}`,
			options.challenge,
			'EX',
			300
		)

		return options
	}

	public async verifyAuthentication(user: User, assertionResponse: any) {
		const expectedChallenge = await this.redisService.get(
			`passkey_challenge:${user.id}`
		)
		if (!expectedChallenge)
			throw new BadRequestException('Challenge не найден или истёк')

		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				},
				include: {
					passkeys: true
				}
			})

		const passkey = mfa.passkeys.find(
			pk => pk.credentialId === assertionResponse.id
		)

		if (!passkey) throw new BadRequestException('Ключ не зарегистрирован')

		const verification = await verifyAuthenticationResponse({
			response: assertionResponse,
			expectedChallenge,
			expectedOrigin: this.WEBAUTHN_ORIGIN,
			expectedRPID: this.WEBAUTHN_RP_ID,
			credential: {
				id: passkey.credentialId,
				publicKey: base64url.toBuffer(passkey.publicKey),
				counter: passkey.counter ?? 0
			}
		})

		if (!verification.verified)
			throw new UnauthorizedException('Аутентификация ключа не пройдена')

		await this.prismaService.passkey.update({
			where: {
				id: passkey.id
			},
			data: {
				counter: {
					increment: 1
				},
				lastUsedAt: new Date()
			}
		})

		await this.redisService.del(`passkey_challenge:${user.id}`)

		return true
	}

	public async delete(id: string, user: User) {
		const passkey = await this.prismaService.passkey.findUnique({
			where: {
				id
			},
			include: {
				mfa: {
					include: {
						totp: true,
						passkeys: true
					}
				}
			}
		})

		if (!passkey || passkey.mfa.userId !== user.id)
			throw new NotFoundException('Ключ доступа не найден')

		await this.prismaService.passkey.delete({
			where: {
				id: passkey.id
			}
		})

		const remainingPasskeys = passkey.mfa.passkeys.filter(
			pk => pk.id !== passkey.id
		)

		if (
			(!passkey.mfa.totp ||
				passkey.mfa.totp.status !== TotpStatus.ENABLED) &&
			remainingPasskeys.length === 0 &&
			passkey.mfa.recoveryCodes?.length
		) {
			await this.prismaService.multiFactorAuthentication.update({
				where: {
					id: passkey.mfa.id
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
