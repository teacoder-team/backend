import { Module } from '@nestjs/common'

import { MailModule } from './mail/mail.module'
import { StorageModule } from './storage/storage.module'
import { TelegramModule } from './telegram/telegram.module'

@Module({
	imports: [MailModule, StorageModule, TelegramModule]
})
export class ServicesModule {}
