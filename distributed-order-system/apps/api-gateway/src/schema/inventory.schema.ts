import z from 'zod'

export const addInventorySchema = z.object({
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  stock: z.number(),
  price: z.number(),
  offerPrice: z.number().optional(),
})

export const updateInventorySchema = z.object({
  sku: z.string(),
  quantity: z.number(),
})
