import { Router, Request, Response } from 'express'
import { orderClient } from '../../grpcClients.js'
import { CreateOrderRequest, CreateOrderResponse } from '@core/proto'
import { ServiceError } from '@grpc/grpc-js'

export const orderRouter = Router()

orderRouter.get('/', (req: Request, res: Response) => {
  const request: CreateOrderRequest = { userId: '1', items: [] }
  orderClient.createOrder(
    request,
    (err: ServiceError | null, response: CreateOrderResponse) => {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json(response)
      }
    }
  )
})
