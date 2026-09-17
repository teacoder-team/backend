import {
	Body,
	Container,
	Font,
	Head,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components'
import { Fragment, type ReactNode } from 'react'

const BASE_URL = 'https://teacoder.ru'

const SOCIAL_LINKS = [
	{ label: 'Telegram', href: 'https://t.me/teacoder_official' },
	{ label: 'YouTube', href: 'https://youtube.com/@teacoder52' },
	{ label: 'GitHub', href: 'https://github.com/teacoder52' }
]

interface EmailLayoutProps {
	preview: string
	children: ReactNode
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
	<Html lang="ru" dir="ltr">
		<Head>
			<meta name="color-scheme" content="light" />
			<meta name="supported-color-schemes" content="light" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
			<Font
				fontFamily="Golos Text"
				fallbackFontFamily="Arial"
				webFont={{
					url: 'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&display=swap',
					format: 'woff2'
				}}
			/>
		</Head>
		<Preview>{preview}</Preview>
		<Tailwind>
			<Body className="bg-[#F3F5F9] py-12 m-0">
				<Container className="mx-auto w-full max-w-[460px] rounded-2xl bg-[#FBFCFD] p-8 border border-gray-100 text-center">
					<Section className="mb-2">
						<Img
							src={`${BASE_URL}/touch-icons/512x512.png`}
							width="100"
							height="100"
							alt="TeaCoder"
							className="mx-auto w-[100px] h-[100px] max-w-full"
						/>
					</Section>

					{children}

					<Hr className="border-gray-100 mt-2 mb-6" />

					<Section>
						<Text className="text-[12px] text-gray-400 m-0 mb-2 font-sans tracking-wide">
							{SOCIAL_LINKS.map((social, index) => (
								<Fragment key={social.href}>
									{index > 0 && ' · '}
									<Link href={social.href} className="text-gray-400 no-underline">
										{social.label}
									</Link>
								</Fragment>
							))}
						</Text>
						<Text className="text-[12px] text-gray-400 m-0 font-sans uppercase tracking-wider">
							&copy; {new Date().getFullYear()} TeaCoder
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
)
