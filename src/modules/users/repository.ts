import { db } from '~/infra/db'

export const findUserById = (userId: string) => db.user.findUnique({ where: { id: userId } })

export const updateAvatar = (userId: string, avatarUrl: string) =>
	db.user.update({ where: { id: userId }, data: { avatar: avatarUrl } })
