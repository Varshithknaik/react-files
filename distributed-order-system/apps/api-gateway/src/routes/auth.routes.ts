import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { publish } from '../events/produce.js'
import { TOPICS, USER_EVENTS_TYPE, UserCreatedEvent } from '@core/events'
import { createUserSchema } from '../schema/user.schema.js'
import { prisma } from '../lib/prisma.js'
import { logger } from '@core/logger'

export const authRouter = Router()

authRouter.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, name } = req.body

    const result = createUserSchema.safeParse({ email, name })

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request' })
    }

    try {
      const userId = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            email: result.data.email,
            name: result.data.name,
          },
        })

        await publish<UserCreatedEvent>(TOPICS.USER_EVENTS, {
          eventId: crypto.randomUUID(),
          eventType: USER_EVENTS_TYPE.USER_CREATED,
          occurredAt: new Date().toISOString(),
          version: 1,
          payload: {
            email: result.data.email,
            name: result.data.name,
            id: newUser.id,
          },
        })

        return newUser.id
      })
      res.status(200).json({ id: userId })
    } catch (error) {
      logger.error('Failed to create user and publish event', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

authRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ message: 'OK' })
})
