import { EventEnvelope, ORDER_EVENTS_TYPE } from '@core/events'
import { logger } from '@core/logger'
import { prisma } from '../../lib/prisma.js'
import { processOrderCancelled } from '../../reporitory/order.repository.js'

interface ProcessOrderServiceProps {
  eventEventEnvelop: EventEnvelope<unknown>
  topic: string
  partition: number
  offset: string
}

export const processOrderService = async ({
  eventEventEnvelop,
  topic,
  partition,
  offset,
}: ProcessOrderServiceProps) => {
  const { eventType, eventId, payload } = eventEventEnvelop
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
      switch (eventType) {
        case ORDER_EVENTS_TYPE.ORDER_CANCELLED:
          console.log('order is cancelled')
          await processOrderCancelled({
            payload,
            tx,
          })
          break
        default:
          logger.error(
            `[INVENTORY SERVICE - ORDER] unhanled event of ${eventType} type`
          )
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    logger.info(
      '[IDEMPOTENT] Event already processed in INVENTORY SERVICE - ORDER'
    )
  }
}
