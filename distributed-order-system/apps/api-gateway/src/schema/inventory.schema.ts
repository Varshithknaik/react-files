import z from 'zod'

export const addInventorySchema = z.object({
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  stock: z.number(),
  price: z.number(),
  offerPrice: z.number().optional(),
})

export const bulkAddInventorySchema = z.object({
  products: z
    .array(addInventorySchema)
    .min(1)
    .refine(
      (products) =>
        new Set(products.map((p) => p.sku)).size === products.length,
      { message: 'Duplicate SKUs are not allowed' }
    ),
})

export const updateInventorySchema = z.object({
  sku: z.string(),
  quantity: z.number(),
})
