import { Heading, Section, Text } from '@react-email/components'

import { EmailLayout } from '../components/EmailLayout'

interface NewDeviceLoginEmailProps {
	username?: string
	device?: string | null
	location?: string | null
	ip?: string
	time?: string
}

const Row = ({ label, value }: { label: string; value: string }) => (
	<Text className="m-0 mb-2 text-sm leading-relaxed text-gray-900 text-left">
		<span className="text-gray-400">{label}:</span> {value}
	</Text>
)

export const NewDeviceLoginEmail = ({
	username = 'Elon Mask',
	device = 'Chrome, Windows',
	location = 'Москва, Россия',
	ip = '104.28.225.185',
	time = '30 сентября 2026, 15:14 МСК'
}: NewDeviceLoginEmailProps) => (
	<EmailLayout preview="Вход в аккаунт TeaCoder с нового устройства">
		<Heading className="font-serif text-3xl font-medium leading-tight text-black mb-4">
			Вход с нового устройства
		</Heading>

		<Text className="text-base leading-relaxed text-[#606369] mb-8 tracking-wide">
			Привет, {username}! В Ваш аккаунт TeaCoder только что вошли с устройства, которое мы
			раньше не видели.
		</Text>

		<Section className="bg-[#f3f4f6] rounded-xl py-6 px-6 border border-gray-100 mb-8">
			{device && <Row label="Устройство" value={device} />}
			{location && <Row label="Местоположение" value={location} />}
			{ip && <Row label="IP" value={ip} />}
			{time && <Row label="Время" value={time} />}
		</Section>

		<Text className="text-sm leading-relaxed text-gray-400 mb-2 tracking-wide">
			Если это были Вы, ничего делать не нужно. Если нет - смените пароль и завершите
			остальные сессии в настройках аккаунта.
		</Text>
	</EmailLayout>
)

export default NewDeviceLoginEmail
