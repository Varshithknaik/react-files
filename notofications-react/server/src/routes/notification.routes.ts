import { Router } from 'express'
import {
  getAllNotifications,
  getAllSubscriptions,
  insertNotification,
  markNotificationAsRead,
  saveSubscription,
} from '../store.js'
import { pushSubscriptionSchema } from '../schema/pushSubscription.schema.js'
import {
  notificationPayloadSchema,
  type Notification,
} from '../schema/notification.schema.js'
import { broadcastSSE } from '../sse.js'
import { sendPush } from '../push.js'

export const notificationRouter = Router()

notificationRouter.get('/', (_, res) => {
  res.status(200).json(getAllNotifications())
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

  try {
    saveSubscription(sub.data)
    res.status(201).json({ message: 'Subscription created' })
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

notificationRouter.post('/', async (req, res) => {
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

  try {
    insertNotification(payload)
    // SSE
    // TODO: have pub/sub mechanism to have instead of broadcasting
    broadcastSSE(payload)
    // push
    await sendPush(getAllSubscriptions(), payload)
    res.status(201).json({ message: 'Notification sent' })
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

notificationRouter.put('read/:id', (req, res) => {
  const { id } = req.params
  try {
    markNotificationAsRead(id)
  } catch (e) {
    res.status(200).json({ message: 'Notification marked as read' })
  }
})
