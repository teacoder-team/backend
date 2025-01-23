import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountController } from './account.controller'
import { AccountService } from './account.service'
import { Account, PasswordReset } from './entities'

@Module({
	imports: [TypeOrmModule.forFeature([Account, PasswordReset])],
	controllers: [AccountController],
	providers: [AccountService]
})
export class AccountModule {}
