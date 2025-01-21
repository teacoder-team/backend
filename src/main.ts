import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { parseBoolean } from './common/utils/parse-boolean'
import { setupSwagger } from './common/utils/setup-swagger'
import { getCorsConfig } from './config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	app.use(helmet())

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.enableCors(getCorsConfig(config))

	if (parseBoolean(config.getOrThrow<string>('SWAGGER_ENABLED'))) {
		await setupSwagger(app)
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
