/** @type {import('prettier').Config} */
export default {
	trailingComma: 'none',
	tabWidth: 4,
	useTabs: true,
	semi: false,
	singleQuote: true,
	arrowParens: 'always',
	printWidth: 100,

	importOrder: ['<THIRD_PARTY_MODULES>', '^node:(.*)$', '^@prisma/(.*)$', '^~/(.*)$', '^[./]'],

	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,

	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

	plugins: ['@trivago/prettier-plugin-sort-imports']
}
