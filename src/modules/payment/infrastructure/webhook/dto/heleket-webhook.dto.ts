import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	ValidateNested
} from 'class-validator'

import { HeleketPaymentStatus } from '@/libs/heleket/enums'

export class HeleketPaymentConvertResponse {
	@ApiProperty({
		description: 'Currency code to which the payment was converted',
		example: 'USDT'
	})
	public to_currency: string

	@ApiProperty({
		description: 'Conversion commission',
		example: '0.002',
		nullable: true
	})
	@IsOptional()
	@IsString()
	public commission?: string | null

	@ApiProperty({
		description: 'Conversion rate between payer currency and to_currency',
		example: '0.07700000'
	})
	@IsString()
	public rate: string

	@ApiProperty({
		description:
			'Converted amount in to_currency credited to merchant balance (after commission)',
		example: '0.22638000'
	})
	@IsString()
	public amount: string
}

export class HeleketPaymentWebhookResponse {
	@ApiProperty({
		description: 'Type of webhook object',
		example: 'payment',
		enum: ['payment']
	})
	@IsString()
	public type: 'payment'

	@ApiProperty({
		description: 'Unique payment UUID',
		example: '62f88b36-a9d5-4fa6-aa26-e040c3dbf26d'
	})
	@IsUUID()
	public uuid: string

	@ApiProperty({
		description: 'Your internal order identifier',
		example: '97a75bf8eda5cca41ba9d2e104840fcd'
	})
	@IsString()
	public order_id: string

	@ApiProperty({
		description: 'Invoice amount',
		example: '3.00000000'
	})
	@IsString()
	public amount: string

	@ApiProperty({
		description: 'Amount actually paid by the customer (may be null)',
		example: '3.00000000',
		nullable: true
	})
	@IsOptional()
	@IsString()
	public payment_amount?: string | null

	@ApiProperty({
		description: 'Amount paid by the customer in USD',
		example: '0.23'
	})
	@IsOptional()
	@IsString()
	public payment_amount_usd?: string

	@ApiProperty({
		description:
			'Amount credited to the merchant balance after Heleket commission',
		example: '2.94000000',
		nullable: true
	})
	@IsOptional()
	@IsString()
	public merchant_amount?: string | null

	@ApiProperty({
		description: 'Heleket commission amount',
		example: '0.06000000'
	})
	@IsOptional()
	@IsString()
	public commission?: string

	@ApiProperty({
		description:
			'Whether the invoice is finalized (cannot be paid anymore if true)',
		example: true
	})
	@IsBoolean()
	public is_final: boolean

	@ApiProperty({
		description: 'Payment status',
		enum: HeleketPaymentStatus,
		example: 'paid'
	})
	@IsEnum(HeleketPaymentStatus)
	public status: HeleketPaymentStatus

	@ApiProperty({
		description: "Payer's wallet address",
		example: 'THgEWubVc8tPKXLJ4VZ5zbiiAK7AgqSeGH',
		nullable: true
	})
	@IsOptional()
	@IsString()
	public from?: string | null

	@ApiProperty({
		description: 'UUID of the static wallet (if applicable)',
		example: null,
		nullable: true
	})
	@IsOptional()
	@IsString()
	public wallet_address_uuid?: string | null

	@ApiProperty({
		description: 'Blockchain network of the transaction',
		example: 'tron'
	})
	@IsOptional()
	@IsString()
	public network?: string

	@ApiProperty({
		description: 'Currency of the invoice',
		example: 'TRX'
	})
	@IsString()
	public currency: string

	@ApiProperty({
		description: 'Currency used by the payer',
		example: 'TRX'
	})
	@IsString()
	public payer_currency: string

	@ApiProperty({
		description: 'Amount in payer currency',
		example: '3.00000000'
	})
	@IsString()
	public payer_amount: string

	@ApiProperty({
		description: 'Exchange rate for payer_amount (if applicable)',
		example: '1.0'
	})
	@IsOptional()
	@IsString()
	public payer_amount_exchange_rate?: string

	@ApiProperty({
		description: 'Additional data provided during invoice creation',
		example: null,
		nullable: true
	})
	@IsOptional()
	@IsString()
	public additional_data?: string | null

	@ApiProperty({
		description: 'Transfer identifier (if available)',
		example: null,
		nullable: true
	})
	@IsOptional()
	@IsString()
	public transfer_id?: string | null

	@ApiProperty({
		description:
			'Blockchain transaction hash (may be absent for internal or failed transactions)',
		example:
			'6f0d9c8374db57cac0d806251473de754f361c83a03cd805f74aa9da3193486b',
		nullable: true
	})
	@IsOptional()
	@IsString()
	public txid?: string | null

	@ApiProperty({
		description: 'Webhook signature (used for validation)',
		example: 'a76c0d77f3e8e1a419b138af04ab600a'
	})
	@IsString()
	public sign: string

	@ApiProperty({
		description:
			'Currency conversion information (if automatic conversion was enabled)',
		type: () => HeleketPaymentConvertResponse
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => HeleketPaymentConvertResponse)
	public convert?: HeleketPaymentConvertResponse
}
