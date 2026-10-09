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
	notifyPaymentError: PaymentErrorNotification
}

export interface PaymentErrorContext {
	source: 'CREATE_PAYMENT' | 'WEBHOOK'
	error: unknown
	status: number
	provider?: string
	path?: string
	paymentId?: string
	webhookId?: string
	pspIntentId?: string
	requestId?: string
	userId?: string
}

export interface PaymentErrorNotification extends Omit<PaymentErrorContext, 'error'> {
	errorName: string
	errorCode?: string
	reason: string
	occurredAt: string
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
