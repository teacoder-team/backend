import { defineConfig } from 'prisma/config'

try {
	process.loadEnvFile()
} catch {}

export default defineConfig({
	schema: 'prisma/models',
	migrations: {
		path: 'prisma/migrations'
	},
	datasource: {
		url: process.env['DATABASE_URL']
	}
})
