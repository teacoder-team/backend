import { Slug } from '../value-objects/slug.vo'

export class Course {
	constructor(
		public readonly id: string,
		public title: string,
		public slug: Slug,
		public shortDescription?: string | null,
		public fullDescription?: string | null,
		public thumbnail?: string | null,
		public youtubeUrl?: string | null,
		public views = 0,
		public attachment?: string | null,
		public isPublished = false,
		public createdAt?: Date
	) {}

	incrementViews() {
		this.views += 1
	}

	setAttachment(filename: string) {
		this.attachment = filename
	}
}
