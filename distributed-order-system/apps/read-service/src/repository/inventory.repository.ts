import { InventoryProductCreatedSchema } from '@core/events'
import { InventoryView } from '../models/InventoryView.js'

export const processProductAdded = async ({
  payload,
  eventId,
  occurredAt,
}: {
  payload: unknown
  eventId: string
  occurredAt: string
}) => {
  const parsed = InventoryProductCreatedSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error('[READ SERVICE] Invalid product added event payload')
  }

  const { product } = parsed.data

  await InventoryView.create({
    sku: product.sku,
    name: product.name,
    category: product.category,
    stock: product.stock,
    stockStatus:
      product.stock === 0
        ? 'out_of_stock'
        : product.stock > 10
          ? 'high_stock'
          : 'low_stock',
    price: product.price,
    offerPrice: product.offerPrice,
    effectivePrice: product.offerPrice ?? product.price,
    version: product.version,
    lastEventId: eventId,
    projectedAt: new Date(occurredAt),
  })
}
