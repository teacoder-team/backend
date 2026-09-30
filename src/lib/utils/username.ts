import { randomBytes } from 'node:crypto'

const USERNAME_BYTES = 8

export const generateUsername = () => randomBytes(USERNAME_BYTES).toString('hex')
