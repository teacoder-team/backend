import { IsString } from 'class-validator'

export class QueueValidator {
	@IsString()
	public QUEUE_PREFIX: string
}
