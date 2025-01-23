import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { getTypeOrmConfig } from '@/config/typeorm.config'

import { DatabaseService } from './database.service'

@Global()
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTypeOrmConfig,
			inject: [ConfigService]
		})
	],
	providers: [DatabaseService],
	exports: [DatabaseService]
})
export class DatabaseModule {}
