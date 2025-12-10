import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config()

export default defineConfig({
	out: process.env.DRIZZLE_OUT,
	schema: './src/infra/database/drizzle/schema',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.POSTGRES_HOST!,
		port: Number(process.env.POSTGRES_PORT!),
		user: process.env.POSTGRES_USER!,
		password: process.env.POSTGRES_PASSWORD!,
		database: process.env.POSTGRES_DATABASE!,
		ssl: false
	},
	verbose: true,
	strict: true
})
