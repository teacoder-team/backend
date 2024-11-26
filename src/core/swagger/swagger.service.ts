import { Injectable } from '@nestjs/common'
import type { Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class SwaggerService {
	public getJson(res: Response) {
		if (fs.existsSync(this.swaggerJsonPath)) {
			res.download(this.swaggerJsonPath)
		}

		return null
	}

	public getTypescript(res: Response) {
		if (fs.existsSync(this.swaggerTypescriptPath)) {
			res.download(this.swaggerTypescriptPath)
		}

		return null
	}

	private readonly swaggerDirectory = path.resolve(
		process.cwd(),
		'./src/core/swagger/schema'
	)

	private readonly swaggerJsonPath = path.join(
		this.swaggerDirectory,
		'swagger.json'
	)

	private readonly swaggerTypescriptPath = path.join(
		this.swaggerDirectory,
		'api.client.ts'
	)
}
