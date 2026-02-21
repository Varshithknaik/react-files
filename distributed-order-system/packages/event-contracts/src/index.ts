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
