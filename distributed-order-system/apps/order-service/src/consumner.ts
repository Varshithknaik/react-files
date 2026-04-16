// import { Kafka } from 'kafkajs'
// import { EventEnvelope } from '@core/events'
// import dotenv from 'dotenv'
// import { KafkaClient } from '@core/kafka'

// dotenv.config({ quiet: true })

// const kafka = new KafkaClient('read-service-users', [
//   process.env.KAFKA_BROKERS!,
// ])
// const consumer = kafka.createConsumer('read-service-users')

// export async function startOrderConsumer() {
//   await consumer.connect()
//   await consumer.subscribe({ topic: 'users.events', fromBeginning: true })

//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       const envelope: EventEnvelope<any> = JSON.parse(message.value!.toString())

//       console.log(envelope, 'envelope')
//     },
//   })
// }
import { EventEnvelope } from '@core/events'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'

dotenv.config({ quiet: true })

const brokers = [process.env.KAFKA_BROKERS!]

export async function startOrderConsumer(replay = false) {
  // 🔥 dynamic groupId
  const groupId = replay
    ? `read-service-users-replay-${Date.now()}`
    : 'read-service-users'

  const kafka = new KafkaClient(groupId, brokers)
  const consumer = kafka.createConsumer(groupId)

  await consumer.connect()

  await consumer.subscribe({
    topic: 'users.events',
    fromBeginning: replay, // only true in replay mode
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
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
