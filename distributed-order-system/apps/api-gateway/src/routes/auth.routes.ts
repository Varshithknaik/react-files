import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { createUser } from '../repository/user.repository.js'
import { publish } from '../events/produce.js'
import { USER_TOPICS, UserCreatedEvent } from '@core/events'
import { createUserSchema } from '../schema/user.schema.js'

export const authRouter = Router()

authRouter.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('got here')
    const { email, name } = req.body

    const result = createUserSchema.safeParse({ email, name })

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    try {
      const { id } = await createUser(email, name)
      res.status(200).json({ id })

      publish<UserCreatedEvent>(USER_TOPICS.USER_CREATED, {
        eventId: crypto.randomUUID(),
        eventType: USER_TOPICS.USER_CREATED,
        occurredAt: new Date().toISOString(),
        version: 1,
        payload: {
          email: result.data.email,
          name: result.data.name,
          id,
        },
      })

      return
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

authRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('called here')
  return res.status(200).json({ message: 'OK' })
})
