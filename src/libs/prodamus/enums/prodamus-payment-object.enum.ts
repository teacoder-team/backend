/**
 * Тип предмета расчёта (ФФД)
 */
export enum ProductPaymentObject {
	GOODS = 1, // Товар
	EXCISABLE_GOODS = 2, // Подакцизный товар
	WORK = 3, // Работа
	SERVICE = 4, // Услуга
	GAMBLING_BID = 5, // Ставка азартной игры
	GAMBLING_WIN = 6, // Выигрыш азартной игры
	LOTTERY_TICKET = 7, // Лотерейный билет
	LOTTERY_WIN = 8, // Выигрыш лотереи
	IP_TRANSFER = 9, // Передача прав на РИД
	PAYMENT = 10, // Платёж
	AGENT_FEE = 11, // Агентское вознаграждение
	COMPOSITE = 12, // Составной предмет расчёта
	OTHER = 13 // Иное
}
