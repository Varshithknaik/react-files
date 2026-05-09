import { Router, Request, Response } from 'express'
import { sendError } from '../../lib/http-response.js'
import { addInventorySchema } from '../../schema/inventory.schema.js'

export const inventoryRouter = Router()

inventoryRouter.post('/products', (req: Request, res: Response) => {
  const payload = addInventorySchema.safeParse(req.body)
  if (!payload.success) {
    return sendError(res, 400, 'Invalid payload', payload.error.message)
  }
})
