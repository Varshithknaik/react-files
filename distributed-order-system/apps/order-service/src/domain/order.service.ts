import { CreateOrderRequest, CreateOrderResponse } from '@core/proto'
import { reserveStock } from '../grpc/clients.js'
import { prisma } from '../lib/prisma.js'
import {
  EventEnvelope,
  TOPICS,
  OrderCreated,
  ORDER_EVENTS_TYPE,
} from '@core/events'

export async function createOrder(
  request: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const orderId = crypto.randomUUID()
  const paylaod = {
    orderId,
    items: request.items.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    })),
  }

  const reservation = await reserveStock(paylaod)

  if (!reservation.success) {
    throw new Error(reservation.reason)
  }

  const total = reservation.items.reduce(
    (acc, item) => acc + item.quantity * (item.offerPrice ?? item.unitPrice),
    0
  )

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: request.userId,
        total,
        status: 'CONFIRMED',
      },
    })

    const items = await tx.orderItem.createManyAndReturn({
      data: reservation.items.map((item) => ({
        orderId: order.id,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        offerPrice: item.offerPrice,
        effectiveUnitPrice: item.offerPrice ?? item.unitPrice,
        lineTotal: item.quantity * (item.offerPrice ?? item.unitPrice),
        productName: item.productName,
      })),
    })

    const envelope: EventEnvelope<OrderCreated> = {
      eventId: crypto.randomUUID(),
      eventType: ORDER_EVENTS_TYPE.ORDER_CREATED,
      occurredAt: new Date().toISOString(),
      version: 1,
      payload: {
        id: order.id,
        items: items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          offerPrice: item.offerPrice ?? undefined,
          effectiveUnitPrice: item.effectiveUnitPrice,
          lineTotal: item.lineTotal,
          productName: item.productName,
        })),
        version: order.version,
        status: order.status,
        total: order.total,
        updatedAt: order.updatedAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        userId: order.userId,
      },
    }

    await tx.outBoxEvent.create({
      data: {
        aggregateType: 'order.events',
        aggregateId: order.id,
        topic: TOPICS.ORDER_EVENTS,
        eventType: ORDER_EVENTS_TYPE.ORDER_CREATED,
        payload: envelope,
      },
    })

    return {
      orderId: order.id,
      status: order.status,
      total: order.total,
      items: items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.unitPrice,
        offerPrice: item.offerPrice ?? undefined,
        effectiveUnitPrice: item.effectiveUnitPrice,
        lineTotal: item.lineTotal,
        productName: item.productName,
      })),
      createdAt: order.createdAt.toISOString(),
    }
  })
}
