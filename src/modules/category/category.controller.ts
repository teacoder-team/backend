import { Controller } from '@nestjs/common'

import { CategoryService } from './category.service'

@Controller('category')
export class CategoryController {
	public constructor(private readonly categoryService: CategoryService) {}
}
