import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config()

export default defineConfig({
	out: process.env.DRIZZLE_OUT,
	schema: './src/infra/database/drizzle/schema',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.DATABASE_HOST!,
		port: Number(process.env.DATABASE_PORT!),
		user: process.env.DATABASE_USER!,
		password: process.env.DATABASE_PASSWORD!,
		database: process.env.DATABASE_DATABASE!,
		ssl: false
	},
	verbose: true,
	strict: true
})
