import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const KinescopeOptionsSymbol = Symbol()

export type KinescopeOptions = {
	token: string
	projectId: string
}

export type KinescopeAsyncOptions = Pick<ModuleMetadata, 'imports'> &
	Pick<FactoryProvider<KinescopeOptions>, 'useFactory' | 'inject'>

export interface KinescopeVideoResponse {
	id: string
	parent_id: string
	title: string
	description: string
	status: string
	play_link: string
	embed_link: string
	hls_link: string
	created_at: string
}
