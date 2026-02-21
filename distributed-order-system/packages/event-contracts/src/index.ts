export enum OrderTopics {
  ORDER_EVENTS = 'order.lifecycle',
}

export enum OrderEventTypes {
  ORDER_CREATED = 'ORDER_CREATED',
  STOCK_RESERVED = 'STOCK_RESERVED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
}

export interface DomainEvent<T = any> {
  eventId: string
  type: OrderEventTypes
  payload: T
  timestamp: number
}
