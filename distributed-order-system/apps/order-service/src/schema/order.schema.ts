import { z } from 'zod'

export const createOrderSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      sku: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
