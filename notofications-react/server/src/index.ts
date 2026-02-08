import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupGracefulShutdown } from './server.js'
import { notificationRouter } from './routes/notification.routes.js'
import { heartBeat } from './sse.js'

dotenv.config()
const app = express()
app.use(
  cors({
    origin: ['http://localhost:5173'],
  })
)
app.use(express.json())

app.use('/api/notifications', notificationRouter)

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

heartBeat()

setupGracefulShutdown(server)
