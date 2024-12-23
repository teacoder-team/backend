import { BadRequestException, Injectable } from '@nestjs/common'
import type { User } from '@prisma/generated'
import { randomBytes } from 'crypto'
import { encode } from 'hi-base32'
import { TOTP } from 'otpauth'
import * as QRCode from 'qrcode'

import { PrismaService } from '@/core/prisma/prisma.service'

import { EnableTotpDto } from './dto/enable-totp.dto'

@Injectable()
export class TotpService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async enable(user: User, dto: EnableTotpDto) {
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

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				isTotpEnabled: true,
				totpSecret: secret
			}
		})
	}

	public async generateSecret(user: User) {
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

		return { qrCodeUrl, secret }
	}

	public async disable(user: User) {
		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				isTotpEnabled: false,
				totpSecret: null
			}
		})

		return true
	}
}
