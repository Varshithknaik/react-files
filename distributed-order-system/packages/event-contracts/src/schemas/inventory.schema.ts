import z from 'zod'
import { createEventEnvelopeSchema } from '../envelope.js'

export const InventoryProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  stock: z.number().int(),
  price: z.number(),
  offerPrice: z.number().optional(),
  updatedAt: z.string(),
  version: z.number(),
})

export const InventoryProductCreatedSchema = z.object({
  product: InventoryProductSchema,
})
export const InventoryProductCreatedEnvelopeSchema = createEventEnvelopeSchema(
  InventoryProductCreatedSchema
)

export const InventoryBulkCreatedSchema = z.object({
  products: z.array(InventoryProductSchema),
})
export const InventoryBulkCreatedEnvelopeSchema = createEventEnvelopeSchema(
  InventoryBulkCreatedSchema
)

export const InventoryProductUpdatedSchema = z.object({
  products: z.array(
    InventoryProductSchema.partial().required({
      sku: true,
      version: true,
    })
  ),
})

export const InventoryProductUpdatedEnvelopeSchema = createEventEnvelopeSchema(
  InventoryProductUpdatedSchema
)

export const InventoryStockReservedSchema = z.object({
  orderId: z.string(),
  items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number(),
      remainingStock: z.number(),
      version: z.number(),
    })
  ),
  reservedAt: z.string(),
})
export const InventoryStockReservedEnvelopeSchema = createEventEnvelopeSchema(
  InventoryStockReservedSchema
)

export const InventoryStockReservationCancelledSchema = z.object({
  orderId: z.string(),
  items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number(),
      remainingStock: z.number(),
      version: z.number(),
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
