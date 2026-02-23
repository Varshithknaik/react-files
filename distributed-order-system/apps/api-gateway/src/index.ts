import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { logger } from '@core/logger'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const app = express()
app.use(cors())

app.use(
  '/commands',
  createProxyMiddleware({
    target: 'http://order-service:3001',
    pathRewrite: {
      '^/commands': '',
    },
  })
)

app.use(
  '/queries',
  createProxyMiddleware({
    target: 'http://read-service:3004',
    pathRewrite: {
      '^/queries': '',
    },
  })
)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    timestamp: new Date().toISOString(),
    Kafka: process.env.KAFKA_BROKERS,
  })
})

app.listen(4000, () => {
  logger.info('API Gateway listening on port 4000')
})
