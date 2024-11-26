import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import helmet from 'helmet'
import passport from 'passport'

import { getCorsConfig } from './core/config/cors.config'
import { getSessionConfig } from './core/config/session.config'
import { getSwaggerConfig } from './core/config/swagger.config'
import { CoreModule } from './core/core.module'
import { RedisService } from './core/redis/redis.service'
import { setupSwagger } from './core/swagger/swagger.setup'
import { parseBoolean } from './shared/utils/parse-boolean.util'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)

	const config = app.get(ConfigService)
	const redis = app.get(RedisService)

	app.use(helmet())
	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.use(session(getSessionConfig(config, redis)))

	app.use(passport.initialize())
	app.use(passport.session())

	app.enableCors(getCorsConfig(config))

	if (parseBoolean(config.getOrThrow<string>('SWAGGER_ENABLED'))) {
		await setupSwagger(getSwaggerConfig(config), app)
	}

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
	Logger.log(
		`🚀 Server is running at: ${config.getOrThrow<string>('APPLICATION_URL')}`
	)
	if (parseBoolean(config.getOrThrow<string>('SWAGGER_ENABLED'))) {
		Logger.log(
			`📄 Documentation is available at: ${config.getOrThrow<string>('APPLICATION_URL')}${config.getOrThrow<string>('SWAGGER_PREFIX')}`
		)
	}
}

bootstrap()
