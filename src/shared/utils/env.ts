import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

export function validateEnv(
	env: NodeJS.ProcessEnv,
	validatorClass: new () => object
) {
	const instance = plainToInstance(validatorClass, env, {
		enableImplicitConversion: true
	})

	const errors = validateSync(instance, { skipMissingProperties: false })

	if (errors.length > 0) {
		const messages = errors
			.map(err => Object.values(err.constraints ?? {}).join(', '))
			.join('; ')

		throw new Error(`❌ Invalid environment variables: ${messages}`)
	}

	return instance
}
