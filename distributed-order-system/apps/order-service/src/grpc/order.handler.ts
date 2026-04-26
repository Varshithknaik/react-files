import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderServiceServer,
} from '@core/proto'
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js'
import { createOrder } from '../domain/order.service.js'

export const orderService: OrderServiceServer = {
  createOrder: async (
    call: ServerUnaryCall<CreateOrderRequest, CreateOrderResponse>,
    callback: sendUnaryData<CreateOrderResponse>
  ) => {
    try {
      const response = await createOrder(call.request)
      callback(null, response)
    } catch (error) {
      callback(error as Error, null as never)
    }
  },
}
