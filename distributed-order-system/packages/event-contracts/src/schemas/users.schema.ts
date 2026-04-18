import { z } from 'zod'

export const userCreatedSchema = z.object({
  email: z.email(),
  name: z.string(),
  id: z.uuid(),
})

export type UserCreatedEvent = z.infer<typeof userCreatedSchema>
