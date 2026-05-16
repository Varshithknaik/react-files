import {
  InventorySortField,
  inventorySortFieldFromJSON,
  SortDirection,
  sortDirectionFromJSON,
} from '@core/proto'
import z from 'zod'

export const addInventorySchema = z.object({
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  stock: z.number().int(),
  price: z.number(),
  offerPrice: z.number().optional(),
})

export const updateInventorySchema = z.object({
  sku: z.string(),
  quantity: z.number(),
})

export const getInventorySchema = z.object({
  sku: z.string(),
})

export const getInventoryListSchema = z.object({
  sku: z.string().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  stock: z.coerce.number().int().optional(),
  price: z.coerce.number().optional(),
  offerPrice: z.coerce.number().optional(),

  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.string().default(''),

  sortField: z
    .enum(InventorySortField)
    .default(InventorySortField.INVENTORY_SORT_FIELD_CREATED_AT)
    .transform((value, ctx) => {
      const parsed = inventorySortFieldFromJSON(value)

      if (parsed === InventorySortField.UNRECOGNIZED) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid sort field',
        })
        return z.NEVER
      }
      return parsed
    }),
  sortDirection: z
    .enum(SortDirection)
    .default(SortDirection.SORT_DIRECTION_UNSPECIFIED)
    .transform((value, ctx) => {
      const parsed = sortDirectionFromJSON(value)

      if (parsed === SortDirection.UNRECOGNIZED) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid sort direction',
        })
        return z.NEVER
      }
      return parsed
    }),
})
