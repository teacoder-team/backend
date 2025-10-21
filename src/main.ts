import {
	ClassSerializerInterceptor,
	Logger,
	ValidationPipe
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'

import { AppModule } from './app.module'
import {
	getCorsConfig,
	getHelmetConfig,
	getValidationPipeConfig
} from './config'
import type { AllConfigs } from './config/definitions'
import { setupSwagger } from './shared/utils'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	const config = app.get(ConfigService<AllConfigs>)
	const logger = new Logger(AppModule.name)

	app.set('trust proxy', true)

	app.use(helmet(getHelmetConfig()))

	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(app.get(Reflector))
	)
	// app.useGlobalInterceptors(new LoggingInterceptor())
	app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()))

	app.enableCors(getCorsConfig(config))

	setupSwagger(app)

	const port = config.get('app.port', { infer: true })
	const host = config.get('app.host', { infer: true })

	try {
		await app.listen(port)

		logger.log(`🚀 Server is running at: ${host}`)
		logger.log(`📄 Documentation is available at: ${host}/docs`)
	} catch (error) {
		logger.error(`❌ Failed to start server: ${error.message}`, error)
		process.exit(1)
	}
}

bootstrap()
