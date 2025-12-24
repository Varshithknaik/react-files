const express = require('express')
const mongoose = require('mongoose')
const { loginSchema } = require('./schema')
const { connectDB, User } = require('./db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

const app = express()
app.use(express.json())

app.get('/health', (req, res, next) => {
  res.status(200).json({
    messsage: 'working fine',
  })
})

app.post('/users/signup', async (req, res, next) => {
  const { email, password } = req.body

  const parserd = loginSchema.safeParse({ email, password })

  if (!parserd.success) {
    res.status(400).json({
      message: 'Invalid Format',
      error: parserd.error.issues,
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await User.create({
      email,
      password: hashedPassword,
    })
    res.status(201).json({
      message: 'User Created',
    })
  } catch (err) {
    res.status(500).json({
      message: 'Internal Server Error',
    })
  }
})

app.post('/users/login', (req, res, next) => {
  const { password, email } = req.body
  const parserd = loginSchema.safeParse({ password, email })

  if (!parserd.success) {
    res.status(400).json({
      message: 'Invalid Format',
      error: parserd.error.issues,
    })
  }

  try {
    const user = User.findOne({ email })
    if (!user) {
      res.status(404).json({
        message: 'User Not Found',
      })
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET)
    res.status(200).json({
      message: 'Login Successful',
      token,
    })
  } catch (err) {
    res.status(500).json({
      message: 'Internal Server Error',
    })
  }
})

app.get('/users/purchases', (req, res, next) => {})

app.post('/course/purchase', (req, res, next) => {})

app.get('/courses', (req, res, next) => {})

app.get('/courses/:id')

app.listen(3000, async () => {
  await connectDB()
  console.log('App is running')
})
