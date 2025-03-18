import {
	ClassSerializerInterceptor,
	Logger,
	ValidationPipe
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { apiReference } from '@scalar/nestjs-api-reference'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { LoggingInterceptor } from './common/interceptors'
import { setupSwagger } from './common/utils'
import { getCorsConfig, getValidationPipeConfig } from './config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)
	const logger = new Logger(AppModule.name)

	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					scriptSrc: ["'self'", 'https://cdn.jsdelivr.net']
				}
			}
		})
	)

	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector))
	)
	app.useGlobalInterceptors(new LoggingInterceptor())

	app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()))

	app.enableCors(getCorsConfig(config))

	setupSwagger(app)

	app.use(
		'/reference',
		apiReference({
			theme: 'purple',
			spec: {
				url: '/docs/json'
			}
		})
	)

	const port = config.getOrThrow<number>('APPLICATION_PORT')
	const host = config.getOrThrow<string>('APPLICATION_URL')

	try {
		await app.listen(port)

		logger.log(`🚀 Server is running at: ${host}`)
		logger.log(`📄 Documentation is available at: ${host}/docs`)
	} catch (error) {
		logger.error(`❌ Error to start server: ${error.message}`, error)
		process.exit(1)
	}
}

bootstrap()
