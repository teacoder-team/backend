import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'

import { DatabaseService } from './database.service'

@Module({
	providers: [
		{
			provide: 'PG_CONNECTION',
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				const pool = new Pool({
					host: config.get('DB_HOST'),
					port: Number(config.get('DB_PORT')),
					user: config.get('DB_USER'),
					password: config.get('DB_PASSWORD'),
					database: config.get('DB_NAME'),
					ssl:
						config.get('DB_SSL') === 'true'
							? { rejectUnauthorized: false }
							: false
				})

				return await pool.connect()
			}
		},
		DatabaseService
	],
	exports: [DatabaseService]
})
export class DatabaseModule {}
