import { Injectable, NotFoundException } from '@nestjs/common'
import sharp from 'sharp'

import { PrismaService } from '@/core/prisma/prisma.service'
import { generateSlug } from '@/shared/utils/generate-slug.util'

import { S3Service } from '../libs/s3/s3.service'

import { CreateCourseDto } from './dto/create-course.dto'

@Injectable()
export class CourseService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly s3Service: S3Service
	) {}

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
			await this.s3Service.deleteFile(course.thumbnail)
		}

		const fileName = `/courses/${course.id}.webp`

		const processedBuffer = await sharp(file.buffer)
			.resize(1280, 720)
			.webp()
			.toBuffer()

		await this.s3Service.uploadFile(processedBuffer, fileName, 'image/webp')

		await this.prismaService.course.update({
			where: {
				id: course.id
			},
			data: {
				thumbnail: fileName
			}
		})

		return true
	}
}
