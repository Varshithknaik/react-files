import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { KafkaClient } from '@core/kafka'
import { TOPICS } from '@core/events'
import { logger } from '@core/logger'

dotenv.config({ quiet: true })

const app = express()

const OrderView = mongoose.model(
  'OrderView',
  new mongoose.Schema({
    orderId: String,
    total: Number,
    status: String,
  })
)

const kafka = new KafkaClient('order-service', [process.env.KAFKA_BROKERS!])
const consumer = kafka.createConsumer('read-model-group')

app.get('/orders/:id', async (req, res) => {
  const response = await OrderView.findOne({ orderId: req.params.id })
  res.status(200).send(response)
})

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI!)
  await consumer.connect()
  await consumer.subscribe({ topic: TOPICS.ORDER_EVENTS })
  await consumer.run({})
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value!.toString())

      logger.info(`Projecting: ${JSON.stringify(event.type)}`)

      await OrderView.findOneAndUpdate(
        { orderId: event.orderId },
        { status: event.type, total: event.payload.total },
        { upsert: true }
      )
    },
  })

  app.listen(3004)
}

start()
