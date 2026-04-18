import { Producer } from 'kafkajs'
import { EventEnvelope } from '@core/events'
import { z } from 'zod'
import { KafkaClient } from '@core/kafka'

const KAFKA_BROKERS = process.env.KAFKA_BROKERS!

const kafka = new KafkaClient('api-gateway', [KAFKA_BROKERS])

let producer: Producer | null = null

async function getProducer() {
  if (producer) return producer
  producer = kafka.createProducer()
  await producer.connect()
  return producer
}

export async function publish<T>(topic: string, envelope: EventEnvelope<T>) {
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
