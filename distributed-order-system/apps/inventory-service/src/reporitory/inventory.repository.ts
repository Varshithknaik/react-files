import { prisma } from '../lib/prisma.js'
import {
  AddInventoryInput,
  BulkAddInventoryInput,
  GetInventoryInput,
  ListInventoryInput,
} from '../schema/inventory.schema.js'
import { DomainError, DOMAIN_ERROR_CODE } from '../lib/errors.js'
import {
  EventEnvelope,
  InventoryProductCreated,
  TOPICS,
  INVENTORY_EVENTS_TYPE,
} from '@core/events'

export async function addInventory(product: AddInventoryInput) {
  return await prisma.$transaction(async (tx) => {
    const created = await tx.products.create({
      data: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        offerPrice: product.offerPrice,
      },
    })

    const envelope: EventEnvelope<InventoryProductCreated> = {
      eventId: crypto.randomUUID(),
      eventType: INVENTORY_EVENTS_TYPE.PRODUCT_ADDED,
      occurredAt: new Date().toISOString(),
      version: 1,
      payload: {
        product: {
          sku: created.sku,
          name: created.name,
          category: created.category,
          stock: created.stock,
          price: created.price,
          offerPrice: created.offerPrice ?? undefined,
          updatedAt: created.updatedAt.toISOString(),
        },
      },
    }

    await tx.outBoxEvent.create({
      data: {
        aggregateType: 'inventory.product',
        aggregateId: created.sku,
        topic: TOPICS.INVENTORY_EVENTS,
        eventType: INVENTORY_EVENTS_TYPE.PRODUCT_ADDED,
        payload: envelope,
      },
    })

    return { sku: created.sku }
  })
}

export async function bulkAddInventory(products: BulkAddInventoryInput) {
  return await prisma.products.createManyAndReturn({
    data: products.products.map((product) => ({
      sku: product.sku,
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      offerPrice: product.offerPrice,
    })),
    skipDuplicates: true,
    select: {
      sku: true,
    },
  })
}

export async function getInventory(product: GetInventoryInput) {
  const result = await prisma.products.findUnique({
    where: {
      sku: product.sku,
    },
    select: {
      sku: true,
      name: true,
      category: true,
      stock: true,
      price: true,
      offerPrice: true,
    },
  })
  if (!result) {
    throw new DomainError(
      DOMAIN_ERROR_CODE.NOT_FOUND,
      'Product not found',
      `No product found with SKU: ${product.sku}`
    )
  }
  return result
}

export async function listInventory(filters: ListInventoryInput) {
  return await prisma.products.findMany({
    where: {
      sku: filters.sku,
      name: filters.name,
      category: filters.category,
      stock: filters.stock,
      price: filters.price,
      offerPrice: filters.offerPrice,
    },
    take: filters.limit + 1,
    cursor: filters.cursor ? { sku: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : undefined,
    orderBy: {
      [filters.sortField]: filters.sortDirection,
    },
    select: {
      sku: true,
      name: true,
      category: true,
      stock: true,
      price: true,
      offerPrice: true,
    },
  })
}
