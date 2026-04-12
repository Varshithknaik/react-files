import {
  OrderServiceServer,
  CreateOrderRequest,
  CreateOrderResponse,
} from '@core/proto'
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js'

export const orderService: OrderServiceServer = {
  createOrder: (
    call: ServerUnaryCall<CreateOrderRequest, CreateOrderResponse>,
    callback: sendUnaryData<CreateOrderResponse>
  ) => {
    const { userId, items } = call.request
    console.log(userId)
    callback(null, {
      orderId: '1',
      status: '1',
      total: 1,
    })
  },
}
