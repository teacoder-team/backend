import { Controller } from '@nestjs/common'

import { CommentService } from './comment.service'

@Controller('comments')
export class CommentController {
	public constructor(private readonly commentService: CommentService) {}
}
