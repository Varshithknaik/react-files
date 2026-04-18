import { EventEnvelope, TOPICS } from '@core/events'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'

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
      // const offset = message.offset
      try {
        await heartbeat()

        const envelope: EventEnvelope<any> = JSON.parse(
          message.value!.toString()
        )

        console.log(`[${groupId}] ${topic}[${partition}]`, envelope)

        // 👉 TODO: process event safely (idempotent!)
      } catch (err) {
        console.error('Failed to process message', err)
      }
    },
  })
}
