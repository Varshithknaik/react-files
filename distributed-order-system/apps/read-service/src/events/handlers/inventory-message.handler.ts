import { EventEnvelope, INVENTORY_EVENTS_TYPE } from '@core/events'
import mongoose from 'mongoose'
import { ProcessedEvent } from '../../models/ProcessesEvents.js'
import { logger } from '@core/logger'
import { processProductAdded } from '../../repository/inventory.repository.js'

export async function processInventoryEvent(
  eventEnvelop: EventEnvelope<unknown>,
  topic: string,
  partition: number,
  offset: string,
  retry = 0
): Promise<void> {
  const session = await mongoose.startSession()
  const { eventId, eventType, occurredAt } = eventEnvelop
  const logCtx = { eventId, eventType, topic, partition, offset, retry }

  try {
    await session.withTransaction(async () => {
      await ProcessedEvent.create(
        [
          {
            eventId: eventEnvelop.eventId,
            eventType: eventEnvelop.eventType,
            topic,
            partition,
            offset,
          },
        ],
        { session }
      )

      switch (eventType) {
        case INVENTORY_EVENTS_TYPE.PRODUCT_ADDED:
          await processProductAdded({
            payload: eventEnvelop.payload,
            eventId,
            occurredAt,
          })
          break
        // case INVENTORY_EVENTS_TYPE.PRODUCT_UPDATED:
        //   await processProductUpdated()
        //   break
        // case INVENTORY_EVENTS_TYPE.BULK_ADDED:
        //   await processBulkAdded()
        //   break
        default:
          logger.error('[CRITICAL] Unknown event type in ORDER SERVICE', logCtx)
          throw new Error('Unknown event type')
      }
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      // Duplicate key error
      logger.info(
        '[IDEMPOTENT] Event already processed in ORDER SERVICE',
        logCtx
      )
      return
    }

    logger.error(
      '[CRITICAL] Event processing failed in ORDER SERVICE',
      logCtx,
      error
    )
    throw error
  } finally {
    session.endSession()
  }
}
