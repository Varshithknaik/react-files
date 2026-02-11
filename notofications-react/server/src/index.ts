import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupGracefulShutdown } from './server.js'
import { notificationRouter } from './routes/notification.routes.js'
import { heartBeat } from './sse.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ quiet: true })
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(
  cors({
    origin: ['http://localhost:5173'],
  })
)

app.use(express.json())
app.use('/api/notifications', notificationRouter)

const fePath = path.join(__dirname, '../frontend-dist')
app.use(express.static(fePath))

app.use((_, res) => {
  res.sendFile(path.join(fePath, 'index.html'))
})

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

heartBeat()

setupGracefulShutdown(server)
