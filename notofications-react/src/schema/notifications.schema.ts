import z from 'zod'

export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().nullable,
  type: z.enum(['success', 'error', 'info', 'warning']),
  createdAt: z.date(),
  isRead: z.boolean().default(false),
})

export const NotificationStoreSchema = z.array(NotificationSchema)

export type Notifications = z.infer<typeof NotificationSchema>
export type NotificationStore = z.infer<typeof NotificationStoreSchema>
