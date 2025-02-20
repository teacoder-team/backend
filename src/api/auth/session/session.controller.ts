import {
	Body,
	Controller,
	Headers,
	HttpCode,
	HttpStatus,
	Post
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import { ClientIp, UserAgent } from '@/common/decorators'

import { LoginRequest, LoginResponse } from './dto'
import { SessionService } from './session.service'

@ApiTags('Session')
@Controller('auth/session')
export class SessionController {
	public constructor(private readonly sessionService: SessionService) {}

	@ApiOperation({ summary: 'Login', description: 'Login to an account.' })
	@ApiResponse({
		status: HttpStatus.OK,
		type: LoginResponse
	})
	@Turnstile()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Body() dto: LoginRequest,
		@ClientIp() ip: string,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(dto, ip, userAgent)
	}

	@ApiOperation({
		summary: 'Logout',
		description: 'Delete current session.'
	})
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Headers('x-session-token') token: string) {
		return this.sessionService.logout(token)
	}

	// @ApiOperation({
	// 	summary: 'Fetch Sessions',
	// 	description: 'Fetch all sessions associated with this account.'
	// })
	// @ApiResponse({
	// 	status: HttpStatus.OK,
	// 	type: [SessionResponse]
	// })
	// @Get('all')
	// @HttpCode(HttpStatus.OK)
	// @Authorization()
	// public async getSessions(
	// 	@Authorized() user: User,
	// 	@Headers('x-session-token') token: string
	// ) {
	// 	return this.sessionService.getSessions(user, token)
	// }

	// @ApiOperation({
	// 	summary: 'Revoke Session​',
	// 	description: 'Delete a specific active session.'
	// })
	// @Authorization()
	// @Delete(':id')
	// @HttpCode(HttpStatus.OK)
	// public async revoke(
	// 	@Param('id') id: string,
	// 	@Headers('x-session-token') token: string
	// ) {
	// 	return this.sessionService.revoke(id, token)
	// }
}
