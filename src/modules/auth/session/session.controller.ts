import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Req
} from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Request } from 'express'

import { UserAgent } from '@/shared/decorators/user-agent.decorator'

import { Authorization } from '../../../shared/decorators/auth.decorator'
import { UserEntity } from '../account/entities/user.entity'

import { LoginDto } from './dto/login.dto'
import { SessionEntity } from './entities/session.entity'
import { SessionService } from './session.service'

@ApiTags('Session')
@Controller('auth/session')
export class SessionController {
	public constructor(private readonly sessionService: SessionService) {}

	@ApiOperation({ summary: 'Войти в систему' })
	@ApiOkResponse({
		status: 200,
		description: 'Пользователь успешно авторизован',
		type: UserEntity
	})
	@ApiNotFoundResponse({
		status: 404,
		description: 'Пользователь не найден'
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Некорректные данные для входа в систему'
	})
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Req() req: Request,
		@Body() dto: LoginDto,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(req, dto, userAgent)
	}

	@ApiOperation({ summary: 'Выйти из системы' })
	@ApiOkResponse({
		status: 200,
		description: 'Пользователь успешно вышел из системы'
	})
	@ApiInternalServerErrorResponse({
		status: 500,
		description: 'Не удалось завершить сессию'
	})
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Req() req: Request) {
		return this.sessionService.logout(req)
	}

	@ApiOperation({
		summary: 'Получить все активные сессии для пользователя'
	})
	@ApiOkResponse({
		status: 200,
		description: 'Список всех активных сессий',
		type: [SessionEntity]
	})
	@ApiUnauthorizedResponse({
		status: 401,
		description: 'Неавторизованный доступ'
	})
	@Get('all')
	@HttpCode(HttpStatus.OK)
	@Authorization()
	public async findAll(@Req() req: Request) {
		return this.sessionService.findAll(req)
	}

	@ApiOperation({ summary: 'Получить данные текущей активной сессии' })
	@ApiOkResponse({
		status: 200,
		description: 'Данные текущей сессии',
		type: SessionEntity
	})
	@ApiNotFoundResponse({
		status: 404,
		description: 'Сессия не найдена'
	})
	@Get('current')
	@HttpCode(HttpStatus.OK)
	public async findCurrent(@Req() req: Request) {
		return this.sessionService.findCurrent(req)
	}

	@ApiOperation({
		summary: 'Удалить все активные сессии для вошедшего пользователя'
	})
	@ApiOkResponse({
		status: 200,
		description: 'Все сессии удалены'
	})
	@ApiInternalServerErrorResponse({
		status: 500,
		description: 'Не удалось удалить сессии'
	})
	@Delete('all')
	@HttpCode(HttpStatus.OK)
	public async removeAll(@Req() req: Request) {
		return this.sessionService.removeAll(req)
	}

	@ApiOperation({ summary: 'Удалить конкретную сессию по ID' })
	@ApiParam({ name: 'id', description: 'ID сессии для удаления' })
	@ApiOkResponse({
		status: 200,
		description: 'Сессия успешно удалена'
	})
	@ApiConflictResponse({
		status: 409,
		description: 'Невозможно удалить текущую сессию'
	})
	@Delete('by-id/:id')
	@HttpCode(HttpStatus.OK)
	public async removeById(@Req() req: Request, @Param('id') id: string) {
		return this.sessionService.removeById(req, id)
	}
}
