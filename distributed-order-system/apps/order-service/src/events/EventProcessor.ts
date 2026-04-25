import { EventEnvelope, USER_EVENTS_TYPE } from '@core/events'
import { prisma } from '../lib/prisma.js'
import { logger } from '@core/logger'
import { handleUserCreated } from '../handler/user.handler.js'

export async function processEvent(
  envelope: EventEnvelope<unknown>,
  topic: string,
  partition: number,
  offset: string,
  retry = 0
): Promise<void> {
  const { eventId, eventType, payload } = envelope

  try {
    await prisma.$transaction(async (tx) => {
      await tx.processedEvent.create({
        data: {
          eventId,
          eventType,
          topic,
          partition,
          offset: BigInt(offset),
        },
      })

      switch (envelope.eventType) {
        case USER_EVENTS_TYPE.USER_CREATED:
          await handleUserCreated(tx, payload)
          break
        default:
          logger.warn(
            '[IDEMPOTENT] Unknown event type received in ORDER SERVICE',
            {
              eventId,
              eventType,
              topic,
              partition,
              offset,
            }
          )
      }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      logger.info('[IDEMPOTENT] Event already processed in ORDER SERVICE', {
        eventId,
        eventType,
        topic,
        partition,
        offset,
        retry,
      })
      return
    }

    logger.error(
      '[CRITICAL] Event processing failed in ORDER SERVICE',
      {
        eventId,
        eventType,
        topic,
        partition,
        offset,
        retry,
      },
      error
    )
    throw error
  }
}
