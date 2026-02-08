import z from 'zod'

export const notificationPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
})

export const NotificationSchema = notificationPayloadSchema.extend({
  id: z.string(),
  isRead: z.union([z.boolean(), z.number()]).transform((v) => Boolean(v)),
  createdAt: z.string(),
})

export const NotificationStoreSchema = z.array(NotificationSchema)

export type Notification = z.infer<typeof NotificationSchema>
