import z from 'zod'

export const InventoryProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  stock: z.number().int(),
  price: z.number(),
  offerPrice: z.number().optional(),
  updatedAt: z.string(),
})

export const InventoryProductCreatedSchema = z.object({
  product: InventoryProductSchema,
})

export const InventoryBulkCreatedSchema = z.object({
  products: z.array(InventoryProductSchema),
})

export const InventoryProductUpdatedSchema = z.object({
  sku: z.string(),
  changedFields: z.array(InventoryProductSchema.keyof()),
})

export const InventoryStockReservedSchema = z.object({
  orderId: z.string(),
  items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number(),
      remainingStock: z.number(),
    })
  ),
  reservedAt: z.string(),
})

export const InventoryStockReservationCancelledSchema = z.object({
  orderId: z.string(),
  items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number(),
      remainingStock: z.number(),
    })
  ),
  reason: z.string().optional(),
  cancelledAt: z.string(),
})

export type InventoryProductSnapshot = z.infer<typeof InventoryProductSchema>
export type InventoryProductCreated = z.infer<
  typeof InventoryProductCreatedSchema
>
export type InventoryBulkCreated = z.infer<typeof InventoryBulkCreatedSchema>
export type InventoryProductUpdated = z.infer<
  typeof InventoryProductUpdatedSchema
>
export type InventoryStockReserved = z.infer<
  typeof InventoryStockReservedSchema
>
export type InventoryStockReservationCancelled = z.infer<
  typeof InventoryStockReservationCancelledSchema
>
