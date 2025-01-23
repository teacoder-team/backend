import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection } from 'typeorm'

@Injectable()
export class DatabaseService {
	public constructor(
		@InjectConnection() private readonly connection: Connection
	) {}

	public async executeQuery(query: string) {
		return this.connection.query(query)
	}
}
