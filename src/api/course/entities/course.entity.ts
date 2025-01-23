import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm'

@Entity({ name: 'courses' })
export class Course {
	@PrimaryGeneratedColumn()
	public id: string

	@Column()
	public title: string

	@Column({ unique: true })
	public slug: string

	@Column({ type: 'text', nullable: true })
	public description?: string

	@Column({ nullable: true })
	public thumbnail?: string

	@Column({ name: 'youtube_url', nullable: true })
	public youtubeUrl?: string

	@Column({ name: 'code_url', nullable: true })
	public codeUrl?: string

	@Column({ name: 'is_published', default: false })
	public isPublished: boolean

	@CreateDateColumn({ name: 'created_at' })
	public createdAt: Date

	@UpdateDateColumn({ name: 'updated_at' })
	public updatedAt: Date
}
