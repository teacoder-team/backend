import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomBytes } from 'crypto'
import type { Repository } from 'typeorm'

import { Account } from '../account/entities'

import { MultiFactorAuthentication } from './entities'

@Injectable()
export class MfaService {
	public constructor(
		@InjectRepository(MultiFactorAuthentication)
		private readonly mfaRepository: Repository<MultiFactorAuthentication>,
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>
	) {}

	public async fetchRecovery(account: Account): Promise<string[]> {
		const mfa = await this.mfaRepository.findOne({
			where: { account: { id: account.id } }
		})

		if (!mfa || !mfa.recoveryCodes) {
			throw new NotFoundException('MFA not found for this account')
		}

		return mfa.recoveryCodes
	}

	public async generateRecovery(account: Account): Promise<string[]> {
		const recoveryCodes = Array.from({ length: 10 }, () =>
			randomBytes(4).toString('hex')
		)

		let mfa = await this.mfaRepository.findOne({
			where: { account: { id: account.id } }
		})

		if (!mfa) {
			mfa = this.mfaRepository.create({
				account,
				recoveryCodes
			})

			account.mfa = mfa
			await this.accountRepository.save(account)
		} else {
			mfa.recoveryCodes = recoveryCodes
		}

		await this.mfaRepository.save(mfa)

		return recoveryCodes
	}
}
