import { CreateOrderRequest, CreateOrderResponse } from '@core/proto'
import { reserveStock } from '../grpc/clients.js'

export async function createOrder(
  request: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const orderId = crypto.randomUUID()
  const paylaod = {
    orderId,
    items: request.items.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    })),
  }

  const reservation = await reserveStock(paylaod)

  console.log(reservation)

  return {
    orderId: '1',
    status: '1',
    total: 1,
  }
}
