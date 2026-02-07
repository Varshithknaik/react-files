import z from 'zod'

export const pushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export type PushSubscriptionDTO = z.infer<typeof pushSubscriptionSchema>
