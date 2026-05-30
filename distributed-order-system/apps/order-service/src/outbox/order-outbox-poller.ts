import { ORDER_EVENTS_TYPE } from 'packages/event-contracts/src/topics.js'
import {
  MAX_ATTEMPTS,
  OutboxEventHandler,
  publishOutboxEvent,
} from '../events/producers/order-service-producer.js'
import { OrderCreatedEnvelopeSchema } from '@core/events'
import { prisma } from '../lib/prisma.js'
import { logger } from '@core/logger'

const BATCH_SIZE = 50
const POLL_INTERVAL_MS = 5000

const OUTBOX_HANDLERS: Partial<
  Record<keyof typeof ORDER_EVENTS_TYPE, OutboxEventHandler>
> = {
  ORDER_CREATED: { schema: OrderCreatedEnvelopeSchema },
}

function claimOutboxEvents() {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM outbox_events
      WHERE status In ('PENDING' , 'FAILED')
        AND next_attempt_at <= NOW()
        AND attempt < ${MAX_ATTEMPTS}
      ORDER BY created_at ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `

    const ids = rows.map((r) => r.id)
    if (ids.length === 0) return []

    return await tx.outBoxEvent.updateManyAndReturn({
      where: { id: { in: ids } },
      data: {
        status: 'PROCESSING',
        lockedAt: new Date(),
        lockedBy: process.pid?.toString(),
      },
    })
  })
}

export function startOrderOutboxPoller() {
  let isRunning = false

  const timer = setInterval(async () => {
    if (isRunning) return
    isRunning = true

    try {
      const events = await claimOutboxEvents()

      for (const event of events) {
        const handler =
          OUTBOX_HANDLERS[event.eventType as keyof typeof ORDER_EVENTS_TYPE]
        if (!handler) {
          logger.warn(
            `[ORDER Outbox] No handler found for event type ${event.eventType}`
          )
          continue
        }

        await publishOutboxEvent(
          handler,
          event.topic,
          event.id,
          event.attempt,
          event.payload
        )
      }
    } finally {
      isRunning = false
    }
  }, POLL_INTERVAL_MS)

  return () => clearInterval(timer)
}
