import { z } from 'zod'

export const TOPICS = {
  ORDER_EVENTS: 'order.events',
  USER_EVENTS: 'users.events',
  DLQ: 'dlq',
} as const

export const USER_EVENTS_TYPE = {
  USER_CREATED: 'USER_CREATED',
} as const

export const DLQ_EVENTS_TYPE = {
  DLQ_MESSAGE: 'DLQ_MESSAGE',
} as const

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
