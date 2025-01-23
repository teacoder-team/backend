import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from '../account/entities'

import { SessionController } from './session.controller'
import { SessionService } from './session.service'

@Module({
	imports: [TypeOrmModule.forFeature([Account])],
	controllers: [SessionController],
	providers: [SessionService]
})
export class SessionModule {}
