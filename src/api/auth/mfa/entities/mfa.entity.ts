import {
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn
} from 'typeorm'

import { Account } from '../../account/entities'

@Entity({ name: 'mfa' })
export class MultiFactorAuthentication {
	@PrimaryGeneratedColumn('uuid')
	public id: string

	@Column({
		type: 'text',
		name: 'recovery_codes',
		nullable: true,
		array: true
	})
	public recoveryCodes: string[]

	@OneToOne(() => Account, account => account.mfa, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'account_id' })
	public account: Account
}
