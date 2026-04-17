import { EventEnvelope } from '@core/events'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'

dotenv.config({ quiet: true })
const brokers = [process.env.KAFKA_BROKERS!]

interface MessageState {
  topic: string
  partition: number
  offset: string
}

export async function startOrderConsumer(replay = false) {
  const groupId = replay
    ? `read-service-users-replay-${Date.now()}`
    : 'read-service-users'

  const kafka = new KafkaClient(groupId, brokers)
  const consumer = kafka.createConsumer(groupId)

  await consumer.connect()

  await consumer.subscribe({
    topic: 'users.events',
    fromBeginning: replay,
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
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
