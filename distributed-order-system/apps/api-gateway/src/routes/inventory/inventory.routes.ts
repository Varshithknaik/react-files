import { Router, Request, Response } from 'express'
import { sendError, sendSuccess } from '../../lib/http-response.js'
import { addInventorySchema } from '../../schema/inventory.schema.js'
import { inventoryClient } from '../../grpcClients.js'
import { grpcStatusToHttp } from '../../lib/grpc-status-map.js'

export const inventoryRouter = Router()

inventoryRouter.post('/products', (req: Request, res: Response) => {
  const payload = addInventorySchema.safeParse(req.body)
  if (!payload.success) {
    return sendError(res, 400, 'Invalid payload', payload.error.message)
  }

  inventoryClient.addInventory(payload.data, (err, resp) => {
    if (err) {
      return sendError(
        res,
        grpcStatusToHttp(err.code),
        'Failed to add inventory',
        err.message
      )
    }
    return sendSuccess(res, 200, 'Inventory added successfully', resp)
  })
})

inventoryRouter.post('/products/bulk', (req: Request, res: Response) => {
  const payload = addInventorySchema.array().safeParse(req.body)
  if (!payload.success) {
    return sendError(res, 400, 'Invalid payload', payload.error.message)
  }

  inventoryClient.bulkAddInventory({ products: payload.data }, (err, resp) => {
    if (err) {
      return sendError(
        res,
        grpcStatusToHttp(err.code),
        'Failed to add inventory',
        err.message
      )
    }
    return sendSuccess(res, 200, 'Inventory added successfully', resp)
  })
})
