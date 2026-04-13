import { Kafka, Producer } from 'kafkajs'
import { EventEnvelope } from '@core/events'
import { z } from 'zod'

const KAFKA_BROKERS = process.env.KAFKA_BROKERS!

const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: [KAFKA_BROKERS],
})

let producer: Producer | null = null

async function getProducer() {
  if (producer) return producer
  producer = kafka.producer()
  await producer.connect()
  return producer
}

export async function publish<T extends z.ZodTypeAny>(
  topic: string,
  envelope: EventEnvelope<T>
) {
  const producer = await getProducer()
  await producer.send({
    topic,
    messages: [
      {
        key: envelope.eventId,
        value: JSON.stringify(envelope),
      },
    ],
  })
}
