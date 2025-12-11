import { Course } from '../entities/course.entity'

export interface CourseFilters {
	isPublished?: boolean
	take?: number
	orderBy?: {
		field: string
		direction: 'asc' | 'desc'
	}
}

export interface CourseSummary {
	id: string
	title: string
	slug: string
	shortDescription?: string | null
	thumbnail?: string | null
	lessons?: number
}

export interface CourseRepository {
	findAll(filters?: CourseFilters): Promise<CourseSummary[]>
	findPopular(limit?: number): Promise<CourseSummary[]>
	findBySlug(slug: string): Promise<Course | null>
	findById(id: string): Promise<Course | null>
	findLessons(courseId: string): Promise<
		{
			id: string
			title: string
			slug: string
			description?: string | null
			position?: number
		}[]
	>
	incrementViews(id: string): Promise<void>
	create(data: { title: string; slug: string }): Promise<{ id: string }>
}
