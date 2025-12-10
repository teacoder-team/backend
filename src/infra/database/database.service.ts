import {
	Inject,
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit
} from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { PoolClient } from 'pg'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DatabaseService.name)

	public constructor(
		@Inject('PG_CONNECTION') private readonly client: PoolClient
	) {}

	public get db() {
		return drizzle(this.client)
	}

	public async onModuleInit() {
		this.logger.log('DatabaseService initialization started')

		try {
			await this.client.query('SELECT 1')
			this.logger.log('Connected to PostgreSQL successfully')
		} catch (err) {
			this.logger.error('Failed to connect to PostgreSQL', err)
		}
	}

	public async onModuleDestroy() {
		this.logger.log('DatabaseService shutting down...')

		try {
			await this.client.release()
			this.logger.log('PostgreSQL connection released')
		} catch (err) {
			this.logger.error('Error releasing PostgreSQL connection', err)
		}
	}
}
