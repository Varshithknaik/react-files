import { TOPICS } from '@core/events'
import { createKafkaClient } from '../../lib/kafka.js'
import { logger } from '@core/logger'
import { handlePoisonPill } from '../handlers/poison-pill.handler.js'

export async function startInventoryConsumer() {
  const groupId = 'inventory-projections-read-group'

  const kafkaClient = createKafkaClient(groupId)
  const consumer = kafkaClient.createConsumer('samole')
  await consumer.connect()
  await consumer.subscribe({
    topic: TOPICS.INVENTORY_EVENTS,
    fromBeginning: true,
  })

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        console.log(topic, partition, message, 'Message-----------')
        await heartbeat()
        throw new Error('Sample Error')
      } catch (error) {
        logger.error('Failed to process inventory event', {
          error,
        })
        await handlePoisonPill(
          {
            kafka: kafkaClient,
            consumer,
            groupId,
            topic,
            partition,
            offset: message.offset,
            message,
          },
          error as Error,
          'Poison Pill encountered'
        )
      }
    },
  })

  return {
    shutdown: async () => {
      logger.info(
        '[READ SERVICE] Shutting down inventory consumer gracefully...'
      )
      await consumer.stop()
      await consumer.disconnect()
      logger.info('[READ SERVICE] Inventory consumer shut down gracefully')
    },
  }
}
