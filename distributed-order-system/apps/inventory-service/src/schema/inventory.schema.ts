import { z } from 'zod'

export const addInventoryDomainSchema = z
  .object({
    sku: z.string().min(1),
    name: z.string().min(1),
    category: z.string().min(1),
    stock: z.number().int().min(0),
    price: z.number().positive(),
    offerPrice: z.number().positive().optional(),
  })
  .refine(
    (data) => data.offerPrice === undefined || data.offerPrice <= data.price,
    {
      message: 'Offer price must be less than or equal to price',
      path: ['offerPrice'],
    }
  )

export type AddInventoryInput = z.infer<typeof addInventoryDomainSchema>
