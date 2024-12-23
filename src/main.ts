import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'

import { getCorsConfig } from './core/config/cors.config'
import { getSwaggerConfig } from './core/config/swagger.config'
import { CoreModule } from './core/core.module'
import { setupSwagger } from './core/swagger/swagger.setup'
import { parseBoolean } from './shared/utils/parse-boolean.util'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)

	const config = app.get(ConfigService)

	app.use(helmet())

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

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
