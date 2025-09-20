/**
 * Статусы платежей Heleket
 */
export enum HeleketPaymentStatus {
	CONFIRM_CHECK = 'confirm_check',
	PAID = 'paid',
	PAID_OVER = 'paid_over',
	FAIL = 'fail',
	WRONG_AMOUNT = 'wrong_amount',
	CANCEL = 'cancel',
	SYSTEM_FAIL = 'system_fail',
	REFUND_PROCESS = 'refund_process',
	REFUND_FAIL = 'refund_fail',
	REFUND_PAID = 'refund_paid'
}
