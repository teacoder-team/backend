import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { TokenType } from '@prisma/generated'
import { hash } from 'argon2'
import type { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'

import { PrismaService } from '@/core/prisma/prisma.service'
import { MailService } from '@/modules/libs/mail/mail.service'

import { NewPasswordDto } from './dto/new-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Injectable()
export class RecoveryService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}

	public async resetPassword(
		req: Request,
		dto: ResetPasswordDto,
		userAgent: string
	) {
		const { email } = dto

		const user = await this.prismaService.user.findFirst({
			where: {
				email
			}
		})

		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}

		const token = uuidv4()

		const expiresIn = new Date(new Date().getTime() + 300000)

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				type: TokenType.PASSWORD_RESET,
				user: {
					id: user.id
				}
			}
		})

		if (existingToken) {
			await this.prismaService.token.delete({
				where: {
					id: existingToken.id
				}
			})
		}

		const passwordResetToken = await this.prismaService.token.create({
			data: {
				token,
				expiresIn,
				type: TokenType.PASSWORD_RESET,
				user: {
					connect: {
						id: user.id
					}
				}
			},
			include: {
				user: true
			}
		})

		// const metadata = getSessionMetadata(req, userAgent)

		// await this.mailService.sendPasswordReset(
		// 	passwordResetToken.user.email,
		// 	passwordResetToken.token,
		// 	metadata
		// )

		return true
	}

	public async newPassword(dto: NewPasswordDto, token: string) {
		const { password } = dto

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				token,
				type: TokenType.PASSWORD_RESET
			},
			include: {
				user: true
			}
		})

		if (!existingToken) {
			throw new NotFoundException('Токен не найден')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException('Срок действия токена истек')
		}

		await this.prismaService.user.update({
			where: {
				id: existingToken.user.id
			},
			data: {
				password: await hash(password)
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.PASSWORD_RESET
			}
		})

		return true
	}
}
