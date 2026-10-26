import { type Static, t } from 'elysia'

import { QUEUE, QUEUE_NAMES } from '~/lib/queue/queues'

const QueueName = t.UnionEnum(QUEUE_NAMES, {
	description:
		'Очередь задач: `email` - письма, `notifications` - уведомления в админ-бот, `billing` - автосписания подписки, `maintenance` - регулярные фоновые задачи.',
	examples: [QUEUE.EMAIL]
})

const JobStatus = t.UnionEnum(
	['waiting', 'active', 'delayed', 'completed', 'failed', 'paused'] as const,
	{
		description:
			'Состояние задачи: `waiting` - ждёт исполнителя, `active` - выполняется прямо сейчас, `delayed` - запланирована на будущее, `completed` - выполнена, `failed` - упала после всех попыток, `paused` - очередь остановлена.',
		examples: ['waiting']
	}
)

export const JobListQuery = t.Object({
	queue: t.Optional(QueueName),
	status: t.Optional(JobStatus),
	limit: t.Optional(
		t.Number({
			minimum: 1,
			maximum: 100,
			default: 20,
			description: 'Сколько задач вернуть.',
			error: 'limit must be between 1 and 100'
		})
	),
	offset: t.Optional(
		t.Number({
			minimum: 0,
			default: 0,
			description: 'Сколько задач пропустить.',
			error: 'offset must be 0 or greater'
		})
	)
})

export const JobParams = t.Object({
	queue: QueueName,
	id: t.String({
		pattern: '^[A-Za-z0-9:_-]{1,128}$',
		description: 'Идентификатор задачи в очереди.',
		error: 'Invalid job id',
		examples: ['42']
	})
})

const JobItem = t.Object(
	{
		id: t.String({ description: 'Идентификатор задачи в очереди.', examples: ['42'] }),
		name: t.String({
			description: 'Имя обработчика, который выполняет задачу.',
			examples: ['sendPasswordResetLink']
		}),
		queue: QueueName,
		status: t.String({
			description:
				'Состояние задачи. Кроме перечисленных значений может прийти `unknown`, если задача уже удалена из очереди.',
			examples: ['waiting']
		}),
		attempts: t.Number({
			description: 'Сколько попыток выполнения уже сделано.',
			examples: [1]
		}),
		payload: t.Any({
			description:
				'Данные задачи. Значения полей с секретами и личными данными (`email`, `url`, `code`, `token`, `secret`, `password`) заменены на `[hidden]` - в ответ они не попадают.'
		}),
		failedReason: t.Nullable(
			t.String({
				description: 'Почему задача упала. `null`, если падений не было.',
				examples: ['Mail delivery failed']
			})
		),
		createdAt: t.String({
			description: 'Когда задача поставлена в очередь.',
			examples: ['2026-10-26T09:12:31.000Z']
		}),
		processedAt: t.Nullable(
			t.String({
				description: 'Когда задачу взяли в работу. `null` - ещё не брали.',
				examples: ['2026-10-26T09:12:32.000Z']
			})
		),
		finishedAt: t.Nullable(
			t.String({
				description: 'Когда задача завершилась - успешно или с ошибкой. `null` - ещё нет.',
				examples: ['2026-10-26T09:12:33.000Z']
			})
		)
	},
	{ description: 'Задача в очереди.' }
)

export const JobResponse = JobItem

export const JobListResponse = t.Array(JobItem, {
	description: 'Задачи очередей, сначала новые.'
})

export const QueueListResponse = t.Array(
	t.Object(
		{
			name: QueueName,
			isPaused: t.Boolean({
				description: 'Остановлена ли очередь - приостановленная не отдаёт задачи воркерам.',
				examples: [false]
			}),
			counts: t.Object(
				{
					waiting: t.Number({ description: 'Ждут исполнителя.', examples: [3] }),
					active: t.Number({ description: 'Выполняются прямо сейчас.', examples: [1] }),
					delayed: t.Number({
						description: 'Запланированы на будущее.',
						examples: [12]
					}),
					completed: t.Number({
						description:
							'Выполнены и ещё хранятся в Redis. Большинство очередей удаляет такие задачи сразу, поэтому обычно здесь 0.',
						examples: [0]
					}),
					failed: t.Number({
						description: 'Упали после всех попыток.',
						examples: [0]
					}),
					paused: t.Number({
						description: 'Ждут в остановленной очереди.',
						examples: [0]
					})
				},
				{ description: 'Сколько задач в каждом состоянии.' }
			)
		},
		{ description: 'Очередь задач и её состояние.' }
	),
	{ description: 'Все очереди приложения.' }
)

export type JobListInput = Static<typeof JobListQuery>
export type JobQueueName = Static<typeof QueueName>
export type JobStatusFilter = Static<typeof JobStatus>
