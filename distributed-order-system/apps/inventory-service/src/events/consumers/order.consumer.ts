import { logger } from '@core/logger'
import { createKafkaClient } from '../../lib/kafka.js'
import { TOPICS } from '@core/events'

const clientId = 'order-projection-inventory-service'

export async function startOrderConsumer() {
  const kafkaClient = createKafkaClient(clientId)

  const consumer = kafkaClient.createConsumer(clientId + '-consumer')
  await consumer.connect()
  await consumer.subscribe({
    topic: TOPICS.ORDER_EVENTS,
    fromBeginning: true,
  })

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ heartbeat, message }) => {
      await heartbeat()
      console.log(message, 'inventory')
    },
  })

  return {
    shutdown: async () => {
      logger.info(
        '[INVENTORY SERVICE - ORDER] Shutting down order consumer gracefully...'
      )
      await consumer.stop()
      await consumer.disconnect()
      logger.info(
        '[INVENTORY SERVICE - ORDER] Order consumer shut down gracefully'
      )
    },
  }
}
