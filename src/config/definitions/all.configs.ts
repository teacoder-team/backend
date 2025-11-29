import type { AppConfig } from './app.config'
import type { FingerprintConfig } from './fingerprint.config'
import type { HeleketConfig } from './heleket.config'
import type { HostsConfig } from './hosts.config'
import type { KinescopeConfig } from './kinescope.config'
import type { MailerConfig } from './mailer.config'
import type { ProdamusConfig } from './prodamus.config'
import type { QueueConfig } from './queue.config'
import type { RedisConfig } from './redis.config'
import type { RobokassaConfig } from './robokassa.config'
import type { SentinelConfig } from './sentinel.config'
import type { StorageConfig } from './storage.config'
import type { TelegramConfig } from './telegram.config'
import type { TurnstileConfig } from './turnstile.config'
import type { WebAuthnConfig } from './webauthn.config'
import type { YookassaConfig } from './yookassa.config'

export interface AllConfigs {
	app: AppConfig
	fingerprint: FingerprintConfig
	heleket: HeleketConfig
	hosts: HostsConfig
	kinescope: KinescopeConfig
	mailer: MailerConfig
	prodamus: ProdamusConfig
	queue: QueueConfig
	redis: RedisConfig
	robokassa: RobokassaConfig
	sentinel: SentinelConfig
	storage: StorageConfig
	telegram: TelegramConfig
	turnstile: TurnstileConfig
	webauthn: WebAuthnConfig
	yookassa: YookassaConfig
}
