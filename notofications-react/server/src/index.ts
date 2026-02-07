import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupGracefulShutdown } from './server.js'
import { notificationRouter } from './routes/notification.routes.js'

dotenv.config()
const app = express()
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())

app.use('/api/notifications', notificationRouter)

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

setupGracefulShutdown(server)
