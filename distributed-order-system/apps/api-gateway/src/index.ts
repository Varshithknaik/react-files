import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { logger } from '@core/logger'
import dotenv from 'dotenv'
import { orderRouter } from './routes/commands/order.routes.js'

dotenv.config({ quiet: true })

const PORT = process.env.PORT || 4000

const app = express()
app.use(cors())

// const fePath = path.join(__dirname, '../../web-client/dist')
// app.use(express.static(fePath))

app.use('/commands/order', orderRouter)

app.use(
  '/queries/',
  createProxyMiddleware({
    target: 'http://localhost:3004',
    pathRewrite: { '^/queries': '' },
  })
)

app.get('/health', (req, res) => {
  res.send({
    message: 'OK',
    timestamp: new Date().toISOString(),
    Kafka: process.env.KAFKA_BROKERS,
  })
})

// app.use((_, res) => {
//   res.sendFile(path.join(fePath, 'index.html'))
// })

app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`)
})
