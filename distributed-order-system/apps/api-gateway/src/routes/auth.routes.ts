import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { createUser } from '../repository/user.repository.js'

export const authRouter = Router()

authRouter.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('got here')
    const { email, name } = req.body

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' })
    }

    try {
      const { id } = await createUser(email, name)
      return res.status(200).json({ id })
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

authRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('called here')
  return res.status(200).json({ message: 'OK' })
})
