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

const baseEnvelopeSchema = z.object({
  eventId: z.uuid(),
  eventType: z.string(),
  occurredAt: z.iso.datetime(), // ISO 8601
  version: z.number().int().positive(),
})

export interface EventEnvelope<T> extends z.infer<typeof baseEnvelopeSchema> {
  payload: T
}

export const createEventEnvelopeSchema = <T extends z.ZodTypeAny>(
  payloadSchema: T
) =>
  baseEnvelopeSchema
    .extend({
      payload: payloadSchema,
    })
    .strict()

export * from './schemas/index.js'
