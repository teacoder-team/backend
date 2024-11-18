import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateCourseDto {
	@IsString({ message: 'Название должно быть строкой' })
	@IsNotEmpty({ message: 'Название обязательно для заполнения' })
	@MaxLength(100, { message: 'Название не должно превышать 100 символов' })
	public title: string
}
