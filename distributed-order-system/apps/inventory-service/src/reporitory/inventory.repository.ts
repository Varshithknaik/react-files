import { prisma } from '../lib/prisma.js'
import {
  AddInventoryInput,
  BulkAddInventoryInput,
  UpdateInventoryInput,
} from '../schema/inventory.schema.js'
import {
  EventEnvelope,
  InventoryProductCreated,
  TOPICS,
  INVENTORY_EVENTS_TYPE,
  InventoryProductUpdated,
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
          version: created.version,
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
  return await prisma.$transaction(async (tx) => {
    const createdItems = await tx.products.createManyAndReturn({
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
        name: true,
        category: true,
        stock: true,
        price: true,
        offerPrice: true,
        updatedAt: true,
        version: true,
      },
    })

    const envelope: EventEnvelope<InventoryProductCreated>[] = []
    for (const created of createdItems) {
      envelope.push({
        eventId: crypto.randomUUID(),
        eventType: INVENTORY_EVENTS_TYPE.BULK_ADDED,
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
            version: created.version,
          },
        },
      })
    }

    await tx.outBoxEvent.create({
      data: {
        aggregateType: 'inventory.product',
        aggregateId: crypto.randomUUID(),
        topic: TOPICS.INVENTORY_EVENTS,
        eventType: INVENTORY_EVENTS_TYPE.BULK_ADDED,
        payload: envelope,
      },
    })

    return createdItems.map((item) => ({ sku: item.sku }))
  })
}

export async function updateInventory(payload: UpdateInventoryInput) {
  const { sku, ...rest } = payload

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.products.update({
      where: { sku },
      data: {
        stock: rest.stock ?? undefined,
        price: rest.price ?? undefined,
        offerPrice: rest.offerPrice ?? undefined,
        name: rest.name ?? undefined,
        category: rest.category ?? undefined,
        version: {
          increment: 1,
        },
      },
    })

    console.log('updated', updated)

    const envelope: EventEnvelope<InventoryProductUpdated> = {
      eventId: crypto.randomUUID(),
      eventType: INVENTORY_EVENTS_TYPE.PRODUCT_UPDATED,
      occurredAt: new Date().toISOString(),
      version: 1,
      payload: {
        sku: updated.sku,
        name: updated.name,
        category: updated.category,
        stock: updated.stock,
        price: updated.price,
        offerPrice: updated.offerPrice ?? undefined,
        updatedAt: updated.updatedAt.toISOString(),
        version: updated.version,
      },
    }

    await tx.outBoxEvent.create({
      data: {
        aggregateType: 'inventory.product',
        aggregateId: updated.sku,
        topic: TOPICS.INVENTORY_EVENTS,
        eventType: INVENTORY_EVENTS_TYPE.PRODUCT_UPDATED,
        payload: envelope,
      },
    })

    return { sku: updated.sku }
  })
}
