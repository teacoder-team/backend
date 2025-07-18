import {
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	GenerateRegistrationOptionsOpts,
	verifyAuthenticationResponse
} from '@simplewebauthn/server'
import { randomBytes } from 'crypto'
import { TextEncoder } from 'util'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import { RegisterPasskeyRequest } from './dto'

@Injectable()
export class PasskeyService {
	private readonly WEBAUTHN_RP_NAME: string
	private readonly WEBAUTHN_RP_ID: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService
	) {
		this.WEBAUTHN_RP_NAME =
			configService.getOrThrow<string>('WEBAUTHN_RP_NAME')
		this.WEBAUTHN_RP_ID = configService.getOrThrow<string>('WEBAUTHN_RP_ID')
	}

	public async fetchPasskeys(user: User) {
		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				},
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

	public async registerPasskey(
		user: User,
		dto: RegisterPasskeyRequest,
		ip: string,
		userAgent: string
	) {
		const { deviceName, credentialId, publicKey, transports } = dto

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

		const passkey = await this.prismaService.passkey.create({
			data: {
				deviceName,
				credentialId,
				publicKey,
				transports,
				lastUsedAt: new Date(),
				ip,
				userAgent,
				mfa: {
					connect: {
						id: mfa.id
					}
				}
			},
			select: {
				id: true,
				deviceName: true,
				transports: true
			}
		})

		return passkey
	}

	public async generatePasskeyOptions(user: User) {
		const challenge = randomBytes(32).toString('base64url')

		await this.redisService.set(
			`webauthn:challenge:${user.id}`,
			challenge,
			'EX',
			300
		)

		const options: GenerateRegistrationOptionsOpts = {
			rpName: this.WEBAUTHN_RP_NAME,
			rpID: this.WEBAUTHN_RP_ID,
			userID: user.id,
			userName: user.email,
			userDisplayName: user.displayName,
			timeout: 60000,
			attestationType: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				userVerification: 'preferred'
			},
			supportedAlgorithmIDs: [-7, -257],
			challenge
		}

		return generateRegistrationOptions(options)
	}

	async generateLoginOptions() {
		const challenge = randomBytes(32).toString('base64url')

		await this.redisService.set(`webauthn:login:${challenge}`, challenge)

		return {
			options: await generateAuthenticationOptions({
				rpID: this.WEBAUTHN_RP_ID,
				timeout: 60000,
				userVerification: 'preferred',
				challenge
			}),
			challengekey: challenge
		}
	}

	async verifyLogin(body: any) {
		const {
			credential: { id },
			challengekey
		} = body

		const passkey = await this.prismaService.passkey.findUnique({
			where: {
				credentialId: id
			},
			include: {
				mfa: {
					include: {
						user: true
					}
				}
			}
		})

		if (!passkey) throw new NotFoundException('Ключ не найден')

		const expectedChallenge = await this.redisService.get(
			`webauthn:login:${challengekey}`
		)

		if (!expectedChallenge) throw new UnauthorizedException('Нет challenge')

		const { verified, authenticationInfo } =
			await verifyAuthenticationResponse({
				response: body.credential,
				expectedChallenge,
				expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
				expectedRPID: this.WEBAUTHN_RP_ID,
				// credential: {
				// 	id: credential.id,
				// 	publicKey: Buffer.from(passkey.publicKey, 'base64url'),
				// 	counter: passkey.counter
				// },
				authenticator: {
					credentialID: id.toString('base64url'),
					credentialPublicKey: Buffer.from(
						passkey.publicKey,
						'base64url'
					),
					counter: passkey.counter
				}
			})

		if (!verified)
			throw new UnauthorizedException('Подпись недействительна')

		await this.prismaService.passkey.update({
			where: {
				id: passkey.id
			},
			data: {
				counter: authenticationInfo.newCounter,
				lastUsedAt: new Date()
			}
		})

		return { user: passkey.mfa.user }
	}

	public async delete(id: string, user: User) {
		const passkey = await this.prismaService.passkey.findUnique({
			where: {
				id
			},
			include: {
				mfa: true
			}
		})

		if (!passkey || passkey.mfa.userId !== user.id)
			throw new NotFoundException('Ключ доступа не найден')

		await this.prismaService.passkey.delete({
			where: {
				id: passkey.id
			}
		})

		return true
	}
}
