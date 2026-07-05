import { OrderCancelledPayloadSchema } from '@core/events'
import { Prisma } from '@prisma/client/extension'
import { ReservationStatus } from '@prisma/client-inventory-service'

interface ProcessOrderCancelledProps {
  payload: unknown
  tx: Prisma.TransactionClient
}

export const processOrderCancelled = async ({
  payload,
  tx,
}: ProcessOrderCancelledProps) => {
  console.log(payload)
  const parsed = OrderCancelledPayloadSchema.safeParse(payload)
  if (!parsed.success) {
    throw new Error(
      '[INVENTORT SERIVE - ORDER] invalid order cancelled event payload'
    )
  }

  const { orderId, version, updatedAt } = parsed.data

  // Find all the reservation matching the pending and confirmed states
  const reservations = await tx.reservations.findMany({
    where: {
      orderId: orderId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
    },
    select: {
      sku: true,
      quantity: true,
    },
  })

  console.log(reservations, 'resilver')
  throw new Error('Not completed')
}
