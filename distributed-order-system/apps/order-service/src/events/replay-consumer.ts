import { TOPICS } from '@core/events'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'
import { logger } from '@core/logger'
import { Consumer } from 'kafkajs'
import { handleUserMessage } from './message-handler.js'

dotenv.config({ quiet: true })
const brokers = [process.env.KAFKA_BROKERS!]

export async function replayFromOffset(
  fromOffset: string,
  partition?: number,
  stopAfter = 1
): Promise<{ consumer: Consumer; done: Promise<void> }> {
  if (partition == null) {
    throw new Error('Partition is required for replayFromOffset')
  }

  const groupId = `order-service-replay-${Date.now()}`
  const kafka = new KafkaClient(groupId, brokers)
  const consumer = kafka.createConsumer(groupId)

  let processed = 0
  let seekApplied = false

  let resovlveDone!: () => void
  let done = new Promise<void>((resolve) => {
    resovlveDone = resolve
  })

  await consumer.connect()
  await consumer.subscribe({
    topic: TOPICS.USER_EVENTS,
    fromBeginning: false,
  })

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({
      topic,
      partition: msgPartition,
      message,
      heartbeat,
    }) => {
      if (processed >= stopAfter) {
        return
      }
      if (msgPartition !== partition) {
        return
      }

      if (!seekApplied) {
        return
      }

      await handleUserMessage({
        kafka,
        consumer,
        groupId,
        topic,
        partition,
        message,
        heartbeat,
      })

      processed++

      if (processed >= stopAfter) {
        setTimeout(async () => {
          await consumer.stop()
          await consumer.disconnect()
          resovlveDone()
        }, 0)
      }
    },
  })

  consumer.seek({
    topic: TOPICS.USER_EVENTS,
    partition,
    offset: fromOffset,
  })
  seekApplied = true

  logger.info('[ORDER SERVICE] Replay consumer started', {
    groupId,
    topic: TOPICS.USER_EVENTS,
    partition,
    fromOffset,
    stopAfter,
  })

  return {
    consumer,
    done,
  }
}
