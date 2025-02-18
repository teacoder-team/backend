import { Module } from '@nestjs/common'

import { KinescopeModule } from './kinescope/kinescope.module'
import { MailModule } from './mail/mail.module'
import { StorageModule } from './storage/storage.module'

@Module({
	imports: [MailModule, StorageModule, KinescopeModule]
})
export class LibsModule {}
