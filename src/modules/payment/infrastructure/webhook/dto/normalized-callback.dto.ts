export class NormalizedCallbackDto {
	public provider: 'yookassa' | 'heleket' | 'prodamus'
	public isSuccess: boolean
	public paymentId: string
	public amount?: number | string
	public raw: any
}
