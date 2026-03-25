import express from 'express'
import dotenv from 'dotenv'
import { KafkaClient } from '@core/kafka'
import { logger } from '@core/logger'
import grpc from "@grpc/grpc-js"

dotenv.config({ quiet: true })

const app = express()
app.use(express.json())

const server = new grpc.Server()


const kafka = new KafkaClient('order-service', [process.env.KAFKA_BROKERS!])
const producer = kafka.createProducer()

app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    timestamp: new Date().toISOString(),
    Kafka: process.env.KAFKA_BROKERS,
  })
})


app.listen(3001, async () => {
  logger.info(`API Gateway listening on port 3001`)
})
