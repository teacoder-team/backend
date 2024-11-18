import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { type Profile, Strategy } from 'passport-github2'

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
	public constructor(private readonly configService: ConfigService) {
		super({
			clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
			clientSecret: configService.getOrThrow<string>(
				'GITHUB_CLIENT_SECRET'
			),
			callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
			scope: ['user:email']
		})
	}

	public async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: any
	) {
		const { displayName, emails, photos } = profile

		const user = {
			email: emails[0].value,
			name: displayName,
			picture: photos[0].value
		}

		done(null, user)
	}
}
