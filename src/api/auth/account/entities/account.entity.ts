import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm'

import { MultiFactorAuthentication } from '../../mfa/entities'

import { PasswordReset } from './password-reset.entity'

export enum UserRole {
	STUDENT = 'Student',
	ADMIN = 'Admin'
}

@Entity({ name: 'accounts' })
export class Account {
	@PrimaryGeneratedColumn('uuid')
	public id: string

	@Column({ unique: true })
	public email: string

	@Column()
	public password: string

	@Column({ unique: true })
	public username: string

	@Column({ name: 'display_name' })
	public displayName: string

	@Column({ nullable: true })
	public avatar: string

	@Column({ default: 0 })
	public points: number

	@Column({ enum: UserRole, default: UserRole.STUDENT })
	public role: UserRole

	@OneToOne(() => PasswordReset, passwordReset => passwordReset.account, {
		cascade: true,
		nullable: true,
		lazy: true
	})
	@JoinColumn({ name: 'password_reset' })
	public passwordReset: PasswordReset

	@OneToOne(() => MultiFactorAuthentication, mfa => mfa.account, {
		cascade: true
	})
	@JoinColumn({ name: 'mfa_id' })
	public mfa: MultiFactorAuthentication

	@CreateDateColumn({ name: 'created_at' })
	public createdAt: Date

	@UpdateDateColumn({ name: 'updated_at' })
	public updatedAt: Date
}
