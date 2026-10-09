import type { AuthProvider } from '@prisma/generated/client'

export type SignUpMethod = AuthProvider | 'EMAIL'

export type NotificationJobs = {
	notifyCoursePurchase: { paymentId: string }
	notifySubscriptionRenewal: {
		paymentId: string
		outcome: 'charged' | 'declined'
	}
	notifySubscriptionPurchase: {
		paymentId: string
		months: number

		previousExpiresAt: string | null
	}
	notifyRegistration: { userId: string; via: SignUpMethod }

	notifySupportEmail: { emailId: string }
}

export interface SupportEmail {
	from: string
	fromName: string | null
	replyTo: string | null
	subject: string | null
	body: string
	receivedAt: Date
	attachments: readonly { filename: string | null; size: number }[]

	authentication: Record<'spf' | 'dkim' | 'dmarc', string> | null
}
