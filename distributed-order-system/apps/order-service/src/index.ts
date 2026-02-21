import express from 'express'
import pkg from 'pg'
import dotenv from 'dotenv'
import { KafkaClient } from '@kafka/index'
import { v4 as uuid } from 'uuid'
import { OrderTopics } from '@events/index'

dotenv.config({ quiet: true })

const app = express()
app.use(express.json())

const pool = new pkg.Pool({
  connectionString: process.env.ORDER_DB_URL,
})

const kafka = new KafkaClient('order-service', [process.env.KAFKA_BROKER!])
const producer = kafka.createProducer()

app.post('/orders', async (req, res) => {
  const { userId, total } = req.body
  const orderId = uuid()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(
      'INSERT INTO orders (id, user_id, total , status) VALUES ($1, $2, $3 , $4)',
      [orderId, userId, total, 'PENDING']
    )

    await producer.connect()
    await producer.send({
      topic: OrderTopics.ORDER_LIFECYCLE,
      messages: [
        {
          key: orderId,
          value: JSON.stringify({
            orderId,
            userId,
            total,
            status: 'PENDING',
          }),
        },
      ],
    })
  } catch (e) {
    await client.query('ROLLBACK')
    res.status(500).send(e)
  } finally {
    client.release()
  }
})

app.listen(3001)
