import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderServiceServer,
} from '@core/proto'
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js'
import { createOrderSchema } from '../schema/order.schema.js'
import { createOrder } from '../domain/order.service.js'

export const orderService: OrderServiceServer = {
  createOrder: async (
    call: ServerUnaryCall<CreateOrderRequest, CreateOrderResponse>,
    callback: sendUnaryData<CreateOrderResponse>
  ) => {
    try {
      const payload = createOrderSchema.safeParse(call.request)
      if (!payload.success) {
        return callback(payload.error, null as never)
      }

      const response = await createOrder(payload.data)
      callback(null, response)
    } catch (error) {
      callback(error as Error, null as never)
    }
  },
}
