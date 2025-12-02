import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getBullmqConfig } from '@/config'

import { FingerprintModule } from './fingerprint/fingerprint.module'
import { HeleketModule } from './heleket/heleket.module'
import { KinescopeModule } from './kinescope/kinescope.module'
import { MailModule } from './mail/mail.module'
import { PaytureModule } from './payture/payture.module'
import { ProdamusModule } from './prodamus/prodamus.module'
import { RobokassaModule } from './robokassa/robokassa.module'
import { StorageModule } from './storage/storage.module'

@Module({
	imports: [
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getBullmqConfig,
			inject: [ConfigService]
		}),
		MailModule,
		StorageModule,
		KinescopeModule,
		FingerprintModule,
		RobokassaModule,
		HeleketModule,
		ProdamusModule,
		PaytureModule
	]
})
export class LibsModule {}
