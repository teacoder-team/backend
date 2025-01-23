import {
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn
} from 'typeorm'

import { Account } from './account.entity'

@Entity({ name: 'reset_passwords' })
export class PasswordReset {
	@PrimaryGeneratedColumn('uuid')
	public id: string

	@Column()
	public token: string

	@Column()
	public expiry: Date

	@OneToOne(() => Account, account => account.passwordReset, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public account: Promise<Account>
}
