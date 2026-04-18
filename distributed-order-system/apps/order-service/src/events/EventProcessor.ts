import {
  EventEnvelope,
  USER_EVENTS_TYPE,
  userCreatedSchema,
} from '@core/events'
import { prisma } from '../lib/prisma.js'
import { logger } from '@core/logger'
import { handleUserCreated } from '../handler/user.handler.js'

export const eventHandlers = {
  [USER_EVENTS_TYPE.USER_CREATED]: handleUserCreated,
} as const

export async function processEvent(
  envelope: EventEnvelope<unknown>,
  topic: string,
  partition: number,
  offset: string
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
          logger.warn(`[IDEMPOTENT] Unknown event type: ${envelope.eventType}`)
      }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      logger.info(`[IDEMPOTENT] Already processed ${eventId}`)
      return
    }

    logger.error(`[EVENT ERROR] ${eventId}`, error)
    throw error
  }
}
