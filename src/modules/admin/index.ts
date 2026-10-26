import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import {
	JobListQuery,
	JobListResponse,
	JobParams,
	JobResponse,
	QueueListResponse
} from './model'
import { getJob, listJobs, listQueues } from './service'

export const admin = new Elysia({ prefix: '/admin', tags: [TAG.admin] })
	.use(authGuard)
	.model({ JobListQuery, JobListResponse, JobParams, JobResponse, QueueListResponse })
	.get('/queues', async () => await listQueues(), {
		admin: true,
		response: 'QueueListResponse',
		detail: {
			summary: 'Очереди задач',
			description:
				'Все очереди приложения и сколько задач в каждом состоянии. Счётчики читаются из Redis напрямую, поэтому показывают текущее состояние, а не историю. У очередей, которые удаляют выполненные задачи сразу, `completed` почти всегда 0.',
			security: [{ bearerAuth: [] }]
		}
	})
	.get('/jobs', async ({ query }) => await listJobs(query), {
		admin: true,
		query: 'JobListQuery',
		response: 'JobListResponse',
		detail: {
			summary: 'Задачи в очередях',
			description:
				'Текущие задачи, сначала новые. Без параметров отдаёт задачи всех очередей в состояниях `waiting`, `active`, `delayed`, `failed` и `completed`; `queue` и `status` сужают выборку.\n\nЗадачи живут в Redis, а не в базе: выполненные обычно удаляются сразу, упавшие хранятся ограниченное время, поэтому список - не журнал, а снимок состояния. Данные задач приходят без секретов и личных данных.',
			security: [{ bearerAuth: [] }]
		}
	})
	.get('/jobs/:queue/:id', async ({ params }) => await getJob(params.queue, params.id), {
		admin: true,
		params: 'JobParams',
		response: 'JobResponse',
		detail: {
			summary: 'Задача',
			description:
				'Одна задача из Redis по очереди и идентификатору. Если задача уже удалена из очереди - 404, а у ещё живущей задачи `status` может быть `unknown`.',
			security: [{ bearerAuth: [] }]
		}
	})
