import { Injectable, NotFoundException } from '@nestjs/common'
import { type User } from '@prisma/generated'
import { randomBytes } from 'crypto'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class MfaService {
	public constructor(private readonly prismaService: PrismaService) {}

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

	public async generateRecovery(user: User): Promise<string[]> {
		const recoveryCodes = Array.from({ length: 10 }, () =>
			randomBytes(4).toString('hex')
		)

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				mfa: {
					upsert: {
						create: {
							recoveryCodes,
							totp: {
								create: {
									secret: null
								}
							}
						},
						update: {
							recoveryCodes
						}
					}
				}
			}
		})

		return recoveryCodes
	}
}
