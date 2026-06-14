import { OrderConfirmedPayloadSchema } from '@core/events'
import { OrderView } from '../models/OrderView.js'
import { ClientSession } from 'mongoose'

export const processOrderConfirmed = async ({
  payload,
  session,
  eventId,
}: {
  payload: unknown
  session: ClientSession
  eventId: string
}) => {
  const parsed = OrderConfirmedPayloadSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(
      '[READ SERVICE - ORDER] Invalid order confirmed event payload'
    )
  }

  // id: string;
  // userId: string;
  // items: {
  //     id: string;
  //     orderId: string;
  //     sku: string;
  //     quantity: number;
  //     unitPrice: number;
  //     effectiveUnitPrice: number;
  //     lineTotal: number;
  //     productName: string;
  //     offerPrice?: number | undefined;
  // }[];
  // total: number;
  // createdAt: string;
  // updatedAt: string;
  // version: number;
  // status: "CONFIRMED";

  const orderDetails = parsed.data

  await OrderView.create(
    [
      {
        orderId: orderDetails.id,
        lastEventId: eventId,
        userId: orderDetails.userId,
        status: orderDetails.status,
        total: orderDetails.total,
        items: orderDetails.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          effectiveUnitPrice: item.effectiveUnitPrice,
          lineTotal: item.lineTotal,
          productName: item.productName,
          offerPrice: item.offerPrice,
        })),
        version: orderDetails.version,
        createdAt: new Date(orderDetails.createdAt),
        updatedAt: new Date(orderDetails.updatedAt),
        projectedAt: new Date(),
      },
    ],
    { session }
  )
}
