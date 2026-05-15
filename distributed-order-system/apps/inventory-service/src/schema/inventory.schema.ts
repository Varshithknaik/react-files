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

export const bulkAddInventoryDomainSchema = z.object({
  products: z
    .array(addInventoryDomainSchema)
    .min(1)
    .refine(
      (products) =>
        new Set(products.map((p) => p.sku)).size === products.length,
      { message: 'Duplicate SKUs are not allowed' }
    ),
})

export const getInventoryDomainSchema = z.object({
  sku: z.string().min(1),
})

export type AddInventoryInput = z.infer<typeof addInventoryDomainSchema>
export type BulkAddInventoryInput = z.infer<typeof bulkAddInventoryDomainSchema>
export type GetInventoryInput = z.infer<typeof getInventoryDomainSchema>
