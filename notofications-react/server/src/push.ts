import webPush from 'web-push'
import type { PushSubscriptionDTO, Notification } from './schema/index.js'
import dotenv from 'dotenv'

dotenv.config()

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export const sendPush = async (
  subs: PushSubscriptionDTO[],
  notification: Notification
) => {
  const payload = JSON.stringify(notification)
  await Promise.allSettled(
    subs.map((sub) => webPush.sendNotification(sub, payload))
  )
}
