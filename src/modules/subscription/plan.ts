/** The only plan for now. `months` is copied onto each invoice, so a later change never alters what was paid for. */
export const PREMIUM_PLAN = {
	amount: 849,
	months: 1,
	description: 'Оплата премиум-подписки на 1 месяц',
	stars: 150
} as const
