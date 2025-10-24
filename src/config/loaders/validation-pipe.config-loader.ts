import type { ValidationPipeOptions } from '@nestjs/common'

export function getValidationPipeConfig(): ValidationPipeOptions {
	return {
		transform: true,
		whitelist: true
	}
}
