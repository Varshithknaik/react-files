import {
  InventoryBulkCreatedSchema,
  InventoryProductCreatedSchema,
  InventoryStockReservedSchema,
} from '@core/events'
import { InventoryView, StockStatus } from '../models/InventoryView.js'
import { ClientSession } from 'mongoose'

const getStockStatus = (stock: number): StockStatus => {
  if (stock === 0) {
    return 'out_of_stock'
  } else if (stock > 10) {
    return 'in_stock'
  } else {
    return 'low_stock'
  }
}

export const processProductAdded = async ({
  payload,
  eventId,
  occurredAt,
  session,
}: {
  payload: unknown
  eventId: string
  occurredAt: string
  session: ClientSession
}) => {
  const parsed = InventoryProductCreatedSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error(
      '[READ SERVICE - INVENTORY] Invalid product added event payload'
    )
  }
  const { product } = parsed.data

  await InventoryView.create(
    [
      {
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        stockStatus: getStockStatus(product.stock),
        price: product.price,
        offerPrice: product.offerPrice,
        effectivePrice: product.offerPrice ?? product.price,
        version: product.version,
        lastEventId: eventId,
        projectedAt: new Date(occurredAt),
      },
    ],
    { session }
  )
}

export const processStockReserved = async ({
  payload,
  eventId,
  occurredAt,
  session,
}: {
  payload: unknown
  eventId: string
  occurredAt: string
  session: ClientSession
}) => {
  const parsed = InventoryStockReservedSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error('[READ SERVICE] Invalid stock reserved event payload')
  }

  const items = parsed.data.items

  await InventoryView.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { sku: item.sku, version: { $lt: item.version } },
        update: {
          $set: {
            stock: item.remainingStock,
            stockStatus: getStockStatus(item.remainingStock),
            version: item.version,
            lastEventId: eventId,
            updatedAt: new Date(occurredAt),
            projectedAt: new Date(),
          },
        },
      },
    })),
    { session }
  )
}

export const processBulkAdded = async ({
  payload,
  eventId,
  occurredAt,
  session,
}: {
  payload: unknown
  eventId: string
  occurredAt: string
  session: ClientSession
}) => {
  const parsed = InventoryBulkCreatedSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error('[READ SERVICE] Invalid bulk add event payload')
  }

  const { products } = parsed.data

  await InventoryView.insertMany(
    products.map((product) => ({
      sku: product.sku,
      name: product.name,
      category: product.category,
      stock: product.stock,
      stockStatus: getStockStatus(product.stock),
      price: product.price,
      offerPrice: product.offerPrice,
      effectivePrice: product.offerPrice ?? product.price,
      version: product.version,
      lastEventId: eventId,
      projectedAt: new Date(occurredAt),
    })),
    { session }
  )
}
