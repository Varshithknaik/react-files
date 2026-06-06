import { TOPICS } from '@core/events'
import { createKafkaClient } from '../../lib/kafka.js'
import { logger } from '@core/logger'

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
      console.log(topic, partition, message, 'Message-----------')
      await heartbeat()
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
