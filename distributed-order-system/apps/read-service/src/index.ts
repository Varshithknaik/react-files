import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { KafkaClient } from '@core/kafka'
import { TOPICS } from '@core/events'
import { logger } from '@core/logger'
import { env } from './config/env.js'

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

const groupId = 'read-model-group-3'

const kafka = new KafkaClient(groupId, env.kafkaBrokers)
const consumer = kafka.createConsumer(groupId)

app.get('/orders/:id', async (req, res) => {
  const response = await OrderView.findOne({ orderId: req.params.id })
  res.status(200).send(response)
})

const start = async () => {
  console.log('starting [READ SERVICE]')
  await mongoose.connect(env.mongoURI)
  await consumer.connect()
  await consumer.subscribe({
    topic: TOPICS.INVENTORY_EVENTS,
    fromBeginning: true,
  })
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
}

start()
