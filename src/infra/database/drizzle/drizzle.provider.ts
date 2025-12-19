import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export const DRIZZLE_DB = 'DRIZZLE_DB'

export const drizzleProvider = {
	provide: DRIZZLE_DB,
	inject: [ConfigService],
	useFactory: async (config: ConfigService) => {
		const pool = new Pool({
			host: config.get('DATABASE_HOST'),
			port: Number(config.get('DATABASE_PORT')),
			user: config.get('DATABASE_USER'),
			password: config.get('DATABASE_PASSWORD'),
			database: config.get('DATABASE_DATABASE'),
			ssl:
				config.get('DATABASE_SSL') === 'true'
					? { rejectUnauthorized: false }
					: false
		})

		return drizzle(pool)
	}
}
