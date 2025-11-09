/**
 * Тип плательщика для режима самозанятого
 */
export enum NpdIncome {
	FROM_INDIVIDUAL = 'FROM_INDIVIDUAL', // физ. лицо
	FROM_LEGAL_ENTITY = 'FROM_LEGAL_ENTITY', // юр. лицо
	FROM_FOREIGN_AGENCY = 'FROM_FOREIGN_AGENCY' // иностранная организация
}
