import { Router } from 'express'
import { notifications, pushSubscriptions } from '../store.js'
import { pushSubscriptionSchema } from '../schema/pushSubscription.schema.js'
import {
  notificationPayloadSchema,
  type Notification,
} from '../schema/notification.schema.js'
import { broadcastSSE } from '../sse.js'
import { sendPush } from '../push.js'

export const notificationRouter = Router()

notificationRouter.get('/', (_, res) => {
  res.status(200).json(notifications)
})

notificationRouter.get('/sse', (req, res) => {
  import('../sse.js').then(({ sseHandler }) => {
    sseHandler(req, res)
  })
})

notificationRouter.post('/subscribe', (req, res) => {
  const sub = pushSubscriptionSchema.safeParse(req.body)

  if (!sub.success) {
    res.status(400).json({ error: 'Invalid subscription' })
    return
  }

  if (!pushSubscriptions.find((s) => s.endpoint === sub.data.endpoint)) {
    pushSubscriptions.push(sub.data)
  }

  res.status(201).json({ message: 'Subscription created' })
})

notificationRouter.post('/notifications', async (req, res) => {
  const notification = notificationPayloadSchema.safeParse(req.body)

  if (!notification.success) {
    res.status(400).json({ error: 'Invalid notification' })
    return
  }

  const payload: Notification = {
    id: crypto.randomUUID(),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...notification.data,
  }

  notifications.push(payload)

  // SSE
  broadcastSSE(payload)

  // push
  await sendPush(pushSubscriptions, payload)

  res.status(201).json({ message: 'Notification sent' })
})
