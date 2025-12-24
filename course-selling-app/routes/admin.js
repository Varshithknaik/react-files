import { Router } from 'express'

export const adminRouter = Router()

adminRouter.post('/signup', async (req, res, next) => {
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

adminRouter.post('/login', (req, res, next) => {
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

adminRouter.post('/courses', (req, res, next) => {})

adminRouter.get('/courses', (req, res, next) => {})

adminRouter.put('/courses/:id', (req, res, next) => {})
