import z from 'zod'

export const notificationPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
})

export const NotificationSchema = notificationPayloadSchema.extend({
  id: z.string(),
  isRead: z.boolean().default(false),
  createdAt: z.string(),
})

export type Notification = z.infer<typeof NotificationSchema>
