export class NormalizedCallbackDto {
	public provider: 'yookassa' | 'heleket' | 'prodamus'
	public isSuccess: boolean
	public paymentId: string
	public raw: any
}
