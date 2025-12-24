import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db.js'
import { userRouter } from './routes/users.js'
import { coursesRouter } from './routes/courses.js'
import { adminRouter } from './routes/admin.js'

dotenv.config()

const app = express()
app.use(express.json())

app.get('/health', (req, res, next) => {
  res.status(200).json({
    messsage: 'working fine',
  })
})

app.use('/api/v1/users', userRouter)
app.use('/api/v1/courses', coursesRouter)
app.use('/api/v1/admin', adminRouter)

app.listen(3000, async () => {
  await connectDB()
  console.log('App is running')
})
