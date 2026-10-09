import { Button, Heading, Link, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

type AutoRenewal = 'disabled' | 'active' | 'off'

interface SubscriptionPriceChangeEmailProps {
	username?: string
	currentAmount?: number
	newAmount?: number
	currency?: string

	effectiveFrom?: string

	internationalAmount?: number

	expiresAt?: string
	autoRenewal?: AutoRenewal
	premiumUrl?: string
	manageUrl?: string
	termsUrl?: string
}

const Point = ({ children }: { children: React.ReactNode }) => (
	<Text className="m-0 mb-3 text-sm leading-relaxed text-gray-600 text-left">
		<span className="text-gray-400">—</span> {children}
	</Text>
)

export const SubscriptionPriceChangeEmail = ({
	username = 'Elon Mask',
	currentAmount = 449,
	newAmount = 849,
	currency = '₽',
	effectiveFrom = '10 октября 2026',
	internationalAmount,
	expiresAt = '17 октября 2026',
	autoRenewal = 'disabled',
	premiumUrl = 'https://teacoder.ru/premium',
	manageUrl = 'https://teacoder.ru/account/subscription',
	termsUrl = 'https://teacoder.ru/document/terms-of-use'
}: SubscriptionPriceChangeEmailProps) => (
	<EmailLayout preview={`Стоимость TeaCoder Premium изменится с ${effectiveFrom}`}>
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Стоимость подписки изменится
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! Вы получили это письмо, потому что у Вас действует подписка TeaCoder
			Premium. Хотим предупредить заранее: с {effectiveFrom} её стоимость меняется.
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-6 px-6 border border-gray-100 mb-8">
			<Text className="m-0 text-xs uppercase tracking-wider text-gray-400 mb-2">
				С {effectiveFrom}
			</Text>
			<Text className="m-0 text-lg text-gray-900">
				<span className="text-gray-400 line-through">
					{currentAmount} {currency}
				</span>{' '}
				<span className="text-gray-400">&rarr;</span>{' '}
				<span className="font-semibold">
					{newAmount} {currency}
				</span>{' '}
				<span className="text-sm text-gray-400">в месяц</span>
			</Text>
			{internationalAmount && (
				<Text className="m-0 mt-2 text-sm leading-relaxed text-gray-400">
					картой зарубежного банка -{' '}
					<span className="text-gray-600 font-medium">
						{internationalAmount} {currency}
					</span>
				</Text>
			)}
		</Section>

		{autoRenewal === 'disabled' && (
			<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
				Автопродление на Вашем аккаунте мы отключили сами - по новой цене без Вашего
				согласия ничего списано не будет. Оплаченный период действует до{' '}
				<span className="text-gray-900 font-medium">{expiresAt}</span> и остаётся на прежних
				условиях. Чтобы сохранить премиум после этой даты, продлите подписку вручную - уже
				по новой стоимости.
			</Text>
		)}

		{autoRenewal === 'active' && (
			<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
				У Вас включено автопродление, поэтому следующий период спишется уже по новой цене -{' '}
				<span className="text-gray-900 font-medium">
					{newAmount} {currency}
				</span>
				. Текущий оплаченный период действует до{' '}
				<span className="text-gray-900 font-medium">{expiresAt}</span> и остаётся на прежних
				условиях. Если новая цена Вам не подходит, автопродление можно отключить в
				настройках аккаунта в любой момент - доступ сохранится до конца оплаченного периода.
			</Text>
		)}

		{autoRenewal === 'off' && (
			<Text className="text-base leading-relaxed text-[#606369] mb-6 tracking-wide">
				Автопродление у Вас выключено, так что списаний не будет. Оплаченный период
				действует до <span className="text-gray-900 font-medium">{expiresAt}</span> и
				остаётся на прежних условиях - продлить подписку после этой даты можно вручную, уже
				по новой стоимости.
			</Text>
		)}

		<Text className="text-base leading-relaxed text-[#606369] mb-4 tracking-wide">
			Вместе с ценой меняется и то, как мы собираем подписку:
		</Text>

		<Section className="mb-8">
			<Point>
				все курсы, которые сейчас открыты по подписке, такими и останутся - уроки, исходный
				код к ним и просмотр уроков в разделённом формате;
			</Point>
			<Point>
				часть новых курсов в подписку входить не будет - их можно будет купить отдельно и
				навсегда;
			</Point>
			<Point>
				актуальный перечень курсов, входящих в подписку, всегда есть на{' '}
				<Link href={premiumUrl} className="text-gray-600 underline">
					странице подписки
				</Link>
				.
			</Point>
		</Section>

		<Section className="mb-8">
			<Button
				className="bg-[#2563EB] rounded-xl text-white text-base font-semibold no-underline text-center px-8 py-4"
				href={premiumUrl}
			>
				Что входит в подписку
			</Button>
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-6 tracking-wide">
			Управлять подпиской и автопродлением можно в{' '}
			<Link href={manageUrl} className="text-gray-500 underline">
				настройках аккаунта
			</Link>
			.
		</Text>

		<Text className="text-xs leading-relaxed text-gray-400 mb-2 tracking-wide">
			Мы уведомляем Вас об изменении стоимости подписки в соответствии с п. 10.5{' '}
			<Link href={termsUrl} className="text-gray-500 underline">
				пользовательского соглашения
			</Link>
			. Стоимость уже оплаченного периода не меняется (п. 3.5), а отключение автопродления не
			прекращает текущий период и не влечёт возврата средств (п. 10.3).
		</Text>
	</EmailLayout>
)

export default SubscriptionPriceChangeEmail
