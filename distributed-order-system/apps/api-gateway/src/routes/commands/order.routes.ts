import { Router, Request, Response } from 'express'
import { orderClient } from '../../grpcClients.js'
import { CreateOrderRequest, CreateOrderResponse } from '@core/proto'
import { ServiceError } from '@grpc/grpc-js'
import { sendError, sendSuccess } from '../../lib/http-response.js'

export const orderRouter = Router()

orderRouter.get('/', (req: Request, res: Response) => {
  console.log('got the request jerer')
  const request: CreateOrderRequest = { userId: '1', items: [] }
  orderClient.createOrder(
    request,
    (err: ServiceError | null, response: CreateOrderResponse) => {
      if (err) {
        return sendError(res, 500, 'Failed to create order', err.message)
      } else {
        return sendSuccess(res, 200, 'Order created successfully', response)
      }
    }
  )
})
