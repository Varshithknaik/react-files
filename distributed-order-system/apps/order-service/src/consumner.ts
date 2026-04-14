import { Kafka } from 'kafkajs'
import { EventEnvelope } from '@core/events'

const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: process.env.KAFKA_BROKERS!.split(','),
})
const consumer = kafka.consumer({ groupId: 'read-service-users' })

export async function startOrderConsumer() {
  await consumer.connect()
  await consumer.subscribe({ topic: 'users.events', fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      const envelope: EventEnvelope<any> = JSON.parse(message.value!.toString())

      console.log(envelope, 'envelope')
    },
  })
}
