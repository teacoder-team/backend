import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import RedisStore from 'connect-redis'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import helmet from 'helmet'
import IORedis from 'ioredis'

import { CoreModule } from './core/core.module'
import { setupSwagger } from './core/swagger/swagger.setup'
import { ms, type StringValue } from './shared/utils/ms.util'
import { parseBoolean } from './shared/utils/parse-boolean.util'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)

	const config = app.get(ConfigService)
	const redis = new IORedis(config.getOrThrow<string>('REDIS_URI'))

	app.use(helmet())
	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_DOMAIN'),
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseBoolean(
					config.getOrThrow<string>('SESSION_HTTP_ONLY')
				),
				secure: parseBoolean(
					config.getOrThrow<string>('SESSION_SECURE')
				),
				sameSite: 'lax'
			},
			store: new RedisStore({
				client: redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie'],
		methods: ['GET', 'POST', 'PATCH', 'DELETE']
	})

	if (parseBoolean(config.getOrThrow<string>('SWAGGER_ENABLED'))) {
		await setupSwagger(
			{
				title: 'TeaCoder API',
				description: 'API for Teacoder educational platform',
				version: '1.0.0',
				path: config.getOrThrow<string>('SWAGGER_PREFIX'),
				enabled: parseBoolean(
					config.getOrThrow<string>('SWAGGER_ENABLED')
				),
				contact: {
					name: 'TeaCoder Team',
					site: 'https://teacoder.ru',
					email: 'help@teacoder.ru'
				}
			},
			app
		)
	}

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
	Logger.log(
		`🚀 Server is running at: ${config.getOrThrow<string>('APPLICATION_URL')}`
	)
	Logger.log(
		`📄 Documentation is available at: ${config.getOrThrow<string>('APPLICATION_URL')}${config.getOrThrow<string>('SWAGGER_PREFIX')}`
	)
}
bootstrap()
