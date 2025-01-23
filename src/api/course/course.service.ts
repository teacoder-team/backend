import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'

import { slugify } from '@/common/utils'
import { StorageService } from '@/services/storage/storage.service'

import type { CreateCourseDto } from './dto'
import { Course } from './entities'

@Injectable()
export class CourseService {
	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		private readonly storageService: StorageService
	) {}

	public async findAll() {
		const courses = await this.courseRepository.find({
			order: {
				createdAt: 'DESC'
			}
		})
		return courses
	}

	public async findBySlug(slug: string) {
		const course = await this.courseRepository.findOne({
			where: {
				slug
			}
		})

		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		return course
	}

	public async findById(id: string) {
		const course = await this.courseRepository.findOne({
			where: {
				id
			}
		})

		if (!course) {
			throw new NotFoundException('Курс не найден')
		}

		return course
	}

	public async create(dto: CreateCourseDto) {
		const { title } = dto

		const course = this.courseRepository.create({
			title,
			slug: slugify(title)
		})

		await this.courseRepository.save(course)

		return true
	}

	public async changeThumbnail(id: string, file: Express.Multer.File) {
		const course = await this.findById(id)

		if (course.thumbnail) {
			await this.storageService.deleteFile(course.thumbnail)
		}

		await this.courseRepository.update(course.id, {
			thumbnail: null
		})

		return true
	}
}
