import { userCreatedSchema } from '@core/events'
import { logger } from '@core/logger'

export async function handleUserCreated(tx: any, payload: unknown) {
  const parsed = userCreatedSchema.safeParse({ ...(payload as any), id: 'asd' })
  if (!parsed.success) {
    throw new Error('Invalid USER_CREATED payload')
  }

  const { id, email, name } = parsed.data

  await tx.users.create({
    data: { id, email, name },
  })

  logger.info(`[USER_CREATED] User created: ${id}`)
}
