import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'

import { SwaggerService } from './swagger.service'

@ApiTags('Swagger')
@Controller('swagger')
export class SwaggerController {
	public constructor(private readonly swaggerService: SwaggerService) {}

	@ApiOperation({ summary: 'Получить Swagger JSON' })
	@ApiOkResponse({
		description: 'Swagger JSON успешно загружен'
	})
	@Get('json')
	@HttpCode(HttpStatus.OK)
	public async getJson(@Res() res: Response): Promise<void> {
		return this.swaggerService.getJson(res)
	}

	@ApiOperation({ summary: 'Получить Swagger TypeScript клиент' })
	@ApiOkResponse({
		description: 'Swagger TypeScript клиент успешно загружен'
	})
	@Get('typescript')
	@HttpCode(HttpStatus.OK)
	public async getTypescript(@Res() res: Response): Promise<void> {
		return this.swaggerService.getTypescript(res)
	}
}
