import { CreateOrderRequest, CreateOrderResponse } from '@core/proto'

export async function createOrder(
  request: CreateOrderRequest
): Promise<CreateOrderResponse> {
  console.log(request.userId)

  return {
    orderId: '1',
    status: '1',
    total: 1,
  }
}
