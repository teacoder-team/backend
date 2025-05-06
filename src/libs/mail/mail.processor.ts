import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bullmq'

import { MailService } from './mail.service'

@Processor('mail')
@Injectable()
export class MailProcessor extends WorkerHost {
	private readonly logger = new Logger(MailProcessor.name)

	public constructor(private readonly mailService: MailService) {
		super()
	}

	public async process(
		job: Job<{ email: string; subject: string; html: string }>
	): Promise<void> {
		const { email, subject, html } = job.data

		try {
			await this.mailService.sendMail(email, subject, html)

			this.logger.log(`📧 Email successfully sent to ${email}`)
		} catch (error) {
			this.logger.error(
				`❌ Error sending email to ${email}: ${error.message}`
			)
		}
	}
}
