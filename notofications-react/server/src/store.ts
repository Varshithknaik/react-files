import { db } from './db/sqlite.js'
import {
  type PushSubscriptionDTO,
  type Notification,
  NotificationSchema,
  pushSubscriptionSchema,
} from './schema/index.js'

export const sseClients = new Set<import('express').Response>()

export const getAllNotifications = (): Notification[] => {
  const response = db
    .prepare('SELECT * FROM notifications ORDER BY createdAt DESC')
    .all()
  const notifications = NotificationSchema.array().parse(response)
  return notifications
}

export const insertNotification = (notification: Notification) => {
  db.prepare(
    'INSERT INTO notifications (id, title, body, createdAt, isRead) VALUES (@id, @title, @body, @createdAt, @isRead)'
  ).run({
    ...notification,
    isRead: notification.isRead ? 1 : 0,
  })
}

export const saveSubscription = (sub: PushSubscriptionDTO) => {
  db.prepare(
    'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (? , ? , ?)'
  ).run(sub.endpoint, sub.keys.p256dh, sub.keys.auth)
}

export const getAllSubscriptions = (): PushSubscriptionDTO[] => {
  const response = db
    .prepare('SELECT * FROM push_subscriptions')
    .all()
    .map((s: any) => ({
      endpoint: s.endpoint,
      keys: {
        p256dh: s.p256dh,
        auth: s.auth,
      },
    }))
  const subscriptions = pushSubscriptionSchema.array().parse(response)
  return subscriptions
}

export const markNotificationAsRead = (id: string) => {
  db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ?').run(id)
}
