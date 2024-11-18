import { InternalServerErrorException } from '@nestjs/common'
import { User } from '@prisma/generated'
import { Request } from 'express'

import { SessionMetadata } from '@/modules/auth/session/entities/session.entity'

export function saveSession(
	req: Request,
	user: User,
	metadata: SessionMetadata
) {
	return new Promise((resolve, reject) => {
		req.login(user, err => {
			if (err) {
				return reject(
					new InternalServerErrorException(
						'Не удалось сохранить сессию'
					)
				)
			}

			req.session.createdAt = new Date()
			req.session.metadata = metadata

			req.session.save(saveErr => {
				if (saveErr) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить данные сессии'
						)
					)
				}
				resolve({ user })
			})
		})
	})
}
