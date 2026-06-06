import dotenv from 'dotenv'
import { startInventoryConsumer } from './events/consumers/inventory.consumer.js'
import { connectMongo, disconnectMongo } from './lib/mongo.js'

dotenv.config({ quiet: true })

const start = async () => {
  console.log('starting [READ SERVICE]')
  await connectMongo()
  const { shutdown: inventoryConsumerShutdown } = await startInventoryConsumer()

  return {
    inventoryConsumerShutdown,
  }
}

const { inventoryConsumerShutdown } = await start()

process.on('SIGINT', () => {
  inventoryConsumerShutdown()
  disconnectMongo()
})
process.on('SIGTERM', () => {
  inventoryConsumerShutdown()
  disconnectMongo()
})
