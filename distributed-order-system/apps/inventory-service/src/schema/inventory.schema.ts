import { z } from 'zod'
import { InventorySortField, SortDirection } from '@core/proto'

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

export const listInventoryDomainSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
  offerPrice: z.number().positive().optional(),

  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().default(''),

  sortField: z.enum(InventorySortField),
  sortDirection: z.enum(SortDirection),
})

export type AddInventoryInput = z.infer<typeof addInventoryDomainSchema>
export type BulkAddInventoryInput = z.infer<typeof bulkAddInventoryDomainSchema>
export type GetInventoryInput = z.infer<typeof getInventoryDomainSchema>
export type ListInventoryInput = z.infer<typeof listInventoryDomainSchema>
