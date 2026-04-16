import { z } from 'zod'

export enum OrderTopics {
  ORDER_LIFECYCLE = 'order-lifecycle',
}

export enum OrderEvents {
  CREATED = 'ORDER_CREATED',
  STOCK_RESERVED = 'STOCK_RESERVED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
}
export interface OrderCreatedPayload {
  orderId: string
  userId: string
  total: number
}

export const USER_TOPICS = {
  USER_CREATED: 'users.events',
} as const

export const eventEnvelopeSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z
    .object({
      eventId: z.uuid(),
      eventType: z.string(),
      occurredAt: z.string(), // ISO 8601
      version: z.number().int().positive(),
      payload: payloadSchema,
    })
    .strict()

export type EventEnvelope<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof eventEnvelopeSchema<T>>
>
