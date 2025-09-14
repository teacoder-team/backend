import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import {
	AuthenticatorTransportFuture,
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server'
import base64url from 'base64url'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import { RegisterPasskeyRequest } from './dto'

@Injectable()
export class PasskeyService {
	private readonly WEBAUTHN_RP_NAME: string
	private readonly WEBAUTHN_RP_ID: string
	private readonly WEBAUTHN_ORIGIN: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService
	) {
		this.WEBAUTHN_RP_NAME =
			this.configService.getOrThrow<string>('WEBAUTHN_RP_NAME')
		this.WEBAUTHN_RP_ID =
			this.configService.getOrThrow<string>('WEBAUTHN_RP_ID')
		this.WEBAUTHN_ORIGIN =
			this.configService.getOrThrow<string>('WEBAUTHN_ORIGIN')
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

	public async registerPasskey(
		user: User,
		dto: RegisterPasskeyRequest,
		ip: string,
		userAgent: string
	) {
		const { deviceName, transports } = dto

		let mfa = await this.prismaService.multiFactorAuthentication.findUnique(
			{ where: { userId: user.id }, include: { passkeys: true } }
		)

		if (!mfa) {
			mfa = await this.prismaService.multiFactorAuthentication.create({
				data: { userId: user.id },
				include: { passkeys: true }
			})
		}

		const json = await this.redisService.get(`webauthn:register:${user.id}`)
		const challenge = JSON.parse(json)

		console.log('REGISTER: ', challenge)

		const result = await verifyRegistrationResponse({
			response: {
				id: dto.credential.id,
				rawId: dto.credential.rawId,
				response: {
					clientDataJSON: dto.credential.response.clientDataJSON,
					attestationObject: dto.credential.response.attestationObject
				},
				type: 'public-key',
				clientExtensionResults: dto.credential.clientExtensionResults
			},
			expectedChallenge: challenge.challenge,
			expectedOrigin: this.WEBAUTHN_ORIGIN,
			expectedRPID: this.WEBAUTHN_RP_ID
		})

		if (!result.verified || !result.registrationInfo?.credential.id)
			throw new BadRequestException('Registration verification failed')

		const { credential } = result.registrationInfo

		console.log('--- REGISTRATION DEBUG START ---')
		console.log('dto.credential.id (client):', dto.credential.id)
		console.log('dto.credential.rawId (client):', dto.credential.rawId)
		try {
			console.log(
				'client rawId hex:',
				Buffer.from(dto.credential.rawId, 'base64url').toString('hex')
			)
		} catch (e) {
			console.log('cannot decode client rawId')
		}

		console.log(
			'result.registrationInfo.credential.id (verifier):',
			result.registrationInfo?.credential.id
		)

		const savedId =
			typeof result.registrationInfo?.credential.id === 'string'
				? result.registrationInfo.credential.id
				: base64url.encode(
						Buffer.from(result.registrationInfo.credential.id)
					)

		console.log('will save credentialIdBase64url:', savedId)
		console.log('--- REGISTRATION DEBUG END ---')

		const credentialIdBase64url =
			typeof credential.id === 'string'
				? credential.id
				: base64url.encode(Buffer.from(credential.id))

		const publicKeyBase64url =
			typeof credential.publicKey === 'string'
				? credential.publicKey
				: base64url.encode(Buffer.from(credential.publicKey))

		const passkey = await this.prismaService.passkey.create({
			data: {
				deviceName,
				credentialId: credentialIdBase64url,
				publicKey: publicKeyBase64url,
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

	public async generateRegisterOptions(user: User) {
		const passkeys = await this.prismaService.passkey.findMany({
			where: {
				mfa: {
					userId: user.id
				}
			}
		})

		const options = await generateRegistrationOptions({
			rpName: this.WEBAUTHN_RP_NAME,
			rpID: this.WEBAUTHN_RP_ID,
			userID: new TextEncoder().encode(user.id),
			userName: user.email,
			userDisplayName: user.displayName,
			timeout: 1000 * 60,
			attestationType: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				userVerification: 'preferred'
			},
			excludeCredentials: passkeys.map(passkey => ({
				id: passkey.credentialId,
				transports: passkey.transports as AuthenticatorTransportFuture[]
			})),
			supportedAlgorithmIDs: [-7, -257]
		})

		await this.redisService.set(
			`webauthn:register:${user.id}`,
			JSON.stringify(options),
			'EX',
			600
		)

		return options
	}

	async generateLoginOptions() {
		const options = await generateAuthenticationOptions({
			rpID: this.WEBAUTHN_RP_ID,
			timeout: 1000 * 60,
			userVerification: 'preferred'
		})

		await this.redisService.set(
			`webauthn:login:${options.challenge}`,
			JSON.stringify(options),
			'EX',
			60_000
		)

		return options
	}

	async verifyLogin(body: any) {
		const {
			credential: { id, response }
		} = body

		const incomingId =
			typeof id === 'string' ? id : base64url.encode(Buffer.from(id))

		const passkey = await this.prismaService.passkey.findUnique({
			where: {
				credentialId: '445tbx9naFlio4zprr6m2trC3YXyV5M2S1p1dcPxEhc'
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

		const clientDataJSONbuf = Buffer.from(response.clientDataJSON, 'base64')
		const clientData = JSON.parse(clientDataJSONbuf.toString('utf8'))
		const challengeFromClient = clientData.challenge

		const json = await this.redisService.get(
			`webauthn:login:${passkey.credentialId}`
		)
		if (!json) throw new BadRequestException('Challenge expired or missing')

		const options = JSON.parse(json)

		const verification = await verifyAuthenticationResponse({
			response: {
				id,
				rawId: response.rawId,
				type: 'public-key',
				response: {
					authenticatorData: response.authenticatorData,
					clientDataJSON: response.clientDataJSON,
					signature: response.signature,
					userHandle: response.userHandle
				},
				clientExtensionResults: response.clientExtensionResults
			},
			expectedChallenge: options.challenge,
			expectedOrigin: this.WEBAUTHN_ORIGIN,
			expectedRPID: this.WEBAUTHN_RP_ID,
			credential: {
				id: passkey.credentialId,
				publicKey: Buffer.from(passkey.publicKey, 'base64url'),
				counter: passkey.counter || 0
			}
		})

		if (!verification.verified)
			throw new UnauthorizedException(
				'Authentication verification failed'
			)

		await this.prismaService.passkey.update({
			where: {
				id: passkey.id
			},
			data: {
				lastUsedAt: new Date(),
				counter: verification.authenticationInfo?.newCounter
			}
		})

		console.log(body)
		// Возвращаем пользователя (или создаём JWT)
		return passkey.mfa.user
	}

	public async delete(id: string, user: User) {
		const passkey = await this.prismaService.passkey.findUnique({
			where: { id },
			include: { mfa: true }
		})

		if (!passkey || passkey.mfa.userId !== user.id)
			throw new NotFoundException('Ключ доступа не найден')

		await this.prismaService.passkey.delete({ where: { id: passkey.id } })

		return true
	}
}
