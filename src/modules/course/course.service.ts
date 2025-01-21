import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/core/prisma/prisma.service'
import { generateSlug } from '@/shared/utils/generate-slug.util'

import { StorageService } from '../libs/storage/storage.service'

import { CreateCourseDto } from './dto/create-course.dto'

@Injectable()
export class CourseService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	public async findAll() {
		const courses = await this.prismaService.course.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		})

		return courses
	}

	public async findBySlug(slug: string) {
		const course = await this.prismaService.course.findUnique({
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
		const course = await this.prismaService.course.findUnique({
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

		await this.prismaService.course.create({
			data: {
				title,
				slug: generateSlug(title)
			}
		})

		return true
	}

	public async changeThumbnail(id: string, file: Express.Multer.File) {
		const course = await this.findById(id)

		if (course.thumbnail) {
			await this.storageService.deleteFile(course.thumbnail)
		}

		const uploadedFile = await this.storageService.uploadFile(
			file.buffer,
			'courses'
		)

		await this.prismaService.course.update({
			where: {
				id: course.id
			},
			data: {
				thumbnail: null
			}
		})

		return true
	}
}
