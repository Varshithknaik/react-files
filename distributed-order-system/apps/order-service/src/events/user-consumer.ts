import { TOPICS } from '@core/events'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'
import { handleUserMessage } from './message-handler.js'
import { logger } from '@core/logger'

dotenv.config({ quiet: true })
const brokers = [process.env.KAFKA_BROKERS!]

export async function startUserConsumer(
  replay = false
): Promise<{ shutdown: () => Promise<void> }> {
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
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      await handleUserMessage({
        kafka,
        consumer,
        groupId,
        topic,
        partition,
        message,
        heartbeat,
      })
    },
  })

  const shutdown = async () => {
    logger.info('[ORDER SERVICE USER CONSUMER] Shutting down gracefully...')
    await consumer.stop()
    await consumer.disconnect()
    process.exit(0)
  }

  return { shutdown }
}
