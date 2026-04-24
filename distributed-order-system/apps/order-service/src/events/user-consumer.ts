import {
  createEventEnvelopeSchema,
  DLQ_EVENTS_TYPE,
  EventEnvelope,
  TOPICS,
} from '@core/events'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'
import { z } from 'zod'
import { logger } from '@core/logger'
import { processEvent } from './EventProcessor.js'

dotenv.config({ quiet: true })
const brokers = [process.env.KAFKA_BROKERS!]
const MAX_RETRIES = 3
const RETRY_BACKOFF_MS = 1000 // doubles each retry: 1s, 2s, 3s

export async function startUserConsumer(replay = false) {
  const groupId = replay
    ? `read-service-users-replay-${Date.now()}`
    : 'read-service-users'

  const kafka = new KafkaClient(groupId, brokers)
  const consumer = kafka.createConsumer(groupId)

  await consumer.connect()

  await consumer.subscribe({
    topic: TOPICS.USER_EVENTS,
    fromBeginning: true,
  })

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const offset = message.offset
      let envelope: EventEnvelope<unknown>
      await heartbeat()

      try {
        const raw = JSON.parse(message.value!.toString())

        envelope = createEventEnvelopeSchema(z.any()).parse(raw)

        logger.info('Consumed event from order service', {
          groupId,
          topic,
          partition,
          offset,
          eventId: envelope.eventId,
          eventType: envelope.eventType,
        })
      } catch (err) {
        logger.error(
          'Poison pill encountered',
          {
            groupId,
            topic,
            partition,
            offset,
            rawPayload: message.value?.toString() ?? '',
          },
          err
        )

        await kafka.sendToDLQ({
          eventId: crypto.randomUUID(),
          eventType: DLQ_EVENTS_TYPE.DLQ_MESSAGE,
          occurredAt: new Date().toISOString(),
          version: 1,
          payload: {
            originalTopic: topic,
            originalPartition: partition,
            originalOffset: offset,
            originalTimestamp: message.timestamp,
            rawPayload: message.value?.toString() ?? '',
            errorMessage: err instanceof Error ? err.message : String(err),
            errorStack: err instanceof Error ? (err.stack ?? '') : '',
            failedAt: new Date().toISOString(),
            consumerGroup: groupId,
            retryCount: 0,
          },
        })

        // Commit to skip past the poison pill
        await consumer.commitOffsets([
          { topic, partition, offset: (BigInt(offset) + 1n).toString() },
        ])
        logger.info('Committed offset past poison pill', {
          groupId,
          topic,
          partition,
          offset,
        })
        return
      }

      let lastError: Error | null = null

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await heartbeat()
          await processEvent(envelope, topic, partition, offset)
          lastError = null
          break
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          logger.error(
            '[ORDER SERVICE] Event processing attempt failed',
            {
              groupId,
              topic,
              partition,
              offset,
              attempt: attempt + 1,
              maxRetries: MAX_RETRIES,
              eventId: envelope.eventId,
              eventType: envelope.eventType,
            },
            lastError
          )

          if (attempt < MAX_RETRIES - 1) {
            const delay = RETRY_BACKOFF_MS * Math.pow(2, attempt)
            logger.info('[ORDER SERVICE] Retrying event processing', {
              groupId,
              topic,
              partition,
              offset,
              attempt: attempt + 1,
              nextRetryInMs: delay,
              eventId: envelope.eventId,
              eventType: envelope.eventType,
            })
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        }
      }

      if (lastError) {
        // All retries failed → send to DLQ
        await kafka.sendToDLQ({
          eventId: crypto.randomUUID(),
          eventType: DLQ_EVENTS_TYPE.DLQ_MESSAGE,
          occurredAt: new Date().toISOString(),
          version: 1,
          payload: {
            originalTopic: topic,
            originalPartition: partition,
            originalOffset: offset,
            originalTimestamp: message.timestamp,
            rawPayload: message.value?.toString() ?? '',
            errorMessage: lastError.message,
            errorStack: lastError.stack ?? '',
            failedAt: new Date().toISOString(),
            consumerGroup: groupId,
            retryCount: MAX_RETRIES,
          },
        })
        logger.error(
          '[ORDER SERVICE] Event processing failed after retries, moved to DLQ',
          {
            groupId,
            topic,
            partition,
            offset,
            eventId: envelope.eventId,
            eventType: envelope.eventType,
          }
        )
      }

      // Commit AFTER successful processing or DLQ fallback
      await consumer.commitOffsets([
        { topic, partition, offset: (BigInt(offset) + 1n).toString() },
      ])
    },
  })
}
