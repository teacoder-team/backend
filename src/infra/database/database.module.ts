import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'

import { DatabaseService } from './database.service'

@Global()
@Module({
	providers: [
		{
			provide: 'PG_CONNECTION',
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				const pool = new Pool({
					host: config.get('POSTGRES_HOST'),
					port: Number(config.get('POSTGRES_PORT')),
					user: config.get('POSTGRES_USER'),
					password: config.get('POSTGRES_PASSWORD'),
					database: config.get('POSTGRES_DATABASE'),
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
