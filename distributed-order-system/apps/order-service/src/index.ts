import dotenv from 'dotenv'
import { logger } from '@core/logger'
import grpc from '@grpc/grpc-js'
import { OrderServiceService } from '@core/proto'
import { orderService } from './handle.js'
import { startUserConsumer } from './events/user-consumer.js'

dotenv.config({ quiet: true })

const server = new grpc.Server()

// const kafka = new KafkaClient('order-service', [process.env.KAFKA_BROKERS!])
// const producer = kafka.createProducer()

server.addService(OrderServiceService, orderService)

export const startOrderGrpc = async () => {
  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        logger.error(err)
        process.exit(1)
      }
      console.log('Order Service is running in port', port)
    }
  )

  const { shutdown } = await startUserConsumer(false)
  return { shutdown }
}

const { shutdown } = await startOrderGrpc()

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
