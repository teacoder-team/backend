import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from '../auth/account/entities'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	imports: [TypeOrmModule.forFeature([Account])],
	controllers: [UsersController],
	providers: [UsersService]
})
export class UsersModule {}
