import { User } from '@prisma/generated'
import {
	Body,
	Head,
	Html,
	Preview
} from '@react-email/components'
import React from 'react'

interface WelcomeEmailProps {
	user: User
}

const baseUrl = process.env['SITE_URL']

export function WelcomeEmail({ user }: WelcomeEmailProps) {
	return (
		<Html>
			<Head />
			<Body>
				<Preview>
					Успешная регистрация на сайте TeaCoder
				</Preview>
			</Body>
		</Html>
	)
}
