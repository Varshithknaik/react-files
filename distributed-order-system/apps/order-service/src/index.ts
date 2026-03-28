import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'
import { logger } from '@core/logger'
import grpc from "@grpc/grpc-js"
import { OrderServiceService } from '@core/proto'
import { orderService } from './handle.js'

dotenv.config({ quiet: true })

const server = new grpc.Server()

const kafka = new KafkaClient('order-service', [process.env.KAFKA_BROKERS!])
const producer = kafka.createProducer()

server.addService(OrderServiceService, orderService);

export const startOrderGrpc = () => {
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
}

startOrderGrpc()