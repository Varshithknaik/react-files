import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { logger } from '@logger/index'

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
    target: 'http://order-service:3004',
    pathRewrite: {
      '^/queries': '',
    },
  })
)

app.listen(4000, () => {
  logger.info('API Gateway listening on port 4000')
})
