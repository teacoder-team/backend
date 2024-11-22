import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'

import { NewPasswordDto } from '@/modules/auth/recovery/dto/new-password.dto'

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint
	implements ValidatorConstraintInterface
{
	public validate(passwordRepeat: string, args: ValidationArguments) {
		const obj = args.object as NewPasswordDto
		return obj.password === passwordRepeat
	}

	public defaultMessage(validationArguments?: ValidationArguments) {
		return 'Пароли не совпадают'
	}
}
