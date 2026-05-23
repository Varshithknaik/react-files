import { prisma } from '../lib/prisma.js'
import {
  INVENTORY_EVENTS_TYPE,
  InventoryProductCreatedEnvelopeSchema,
  InventoryBulkCreatedEnvelopeSchema,
} from '@core/events'
import {
  MAX_ATTEMPTS,
  OutboxEventHandler,
  publishOutboxEvent,
} from '../events/producers/inventory-service-publish.js'

const BATCH_SIZE = 50
const POLL_INTERVAL_MS = 5000

const WORKER_ID = `inventory-outbox-${crypto.randomUUID()}`

/**
 * Handler map: add a new entry here whenever a new outbox event type is introduced.
 * No new publish function needed — just register the Zod envelope schema.
 */
const OUTBOX_HANDLERS: Partial<
  Record<keyof typeof INVENTORY_EVENTS_TYPE, OutboxEventHandler>
> = {
  PRODUCT_ADDED: { schema: InventoryProductCreatedEnvelopeSchema },
  BULK_ADDED: { schema: InventoryBulkCreatedEnvelopeSchema },
}

function claimOutboxEvents() {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM outbox_events
      WHERE status In ('PENDING', 'FAILED') 
        AND next_attempt_at <= NOW()
        AND attempt < ${MAX_ATTEMPTS}
      ORDER BY created_at ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `
    const ids = rows.map((row) => row.id)
    if (ids.length === 0) return []

    await tx.outBoxEvent.updateMany({
      where: { id: { in: ids } },
      data: {
        status: 'PROCESSING',
        lockedAt: new Date(),
        lockedBy: WORKER_ID,
      },
    })

    return tx.outBoxEvent.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'asc' },
    })
  })
}

// TODO: Instead of POLLING use CDC Outbox Tooling
export function startInventoryOutboxPoller() {
  let isRunning = false
  const timer = setInterval(async () => {
    if (isRunning) return
    isRunning = true

    try {
      const events = await claimOutboxEvents()

      for (const event of events) {
        // Find the matching handler by event type value
        const handlerKey = (
          Object.keys(INVENTORY_EVENTS_TYPE) as Array<
            keyof typeof INVENTORY_EVENTS_TYPE
          >
        ).find((key) => INVENTORY_EVENTS_TYPE[key] === event.eventType)

        const handler = handlerKey ? OUTBOX_HANDLERS[handlerKey] : undefined

        if (!handler) {
          console.warn(
            `No outbox handler registered for eventType: ${event.eventType}`
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
