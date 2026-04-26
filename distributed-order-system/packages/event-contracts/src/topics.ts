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
