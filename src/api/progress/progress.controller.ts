import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ProgressService } from './progress.service'

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
	public constructor(private readonly progressService: ProgressService) {}
}
