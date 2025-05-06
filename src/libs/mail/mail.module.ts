import { MailerModule } from '@nestjs-modules/mailer'
import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getMailerConfig } from '@/config'

import { MailProcessor } from './mail.processor'
import { MailService } from './mail.service'

@Global()
@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getMailerConfig,
			inject: [ConfigService]
		}),
		BullModule.registerQueue({
			name: 'mail'
		})
	],
	providers: [MailService, MailProcessor],
	exports: [MailService]
})
export class MailModule {}
