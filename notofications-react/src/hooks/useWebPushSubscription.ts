import { useCallback, useEffect, useState } from 'react'
import { useNotificationStore } from './useNotificationStore'
import { NotificationSchema } from '../schema/notifications.schema'

export const useNotificationPush = () => {
  const { upsert } = useNotificationStore()

  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  )

  const isSupported =
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window

  useEffect(() => {
    if (!isSupported) return

    navigator.serviceWorker.register('/sw.js')
  }, [isSupported])

  // Listen to SW -> React messages
  useEffect(() => {
    if (!navigator.serviceWorker) return

    const handler = (event: MessageEvent) => {
      const parsed = NotificationSchema.safeParse(event.data)

      if (!parsed.success) {
        console.error('Invalid push Payload', parsed.error)
        return
      }

      upsert(parsed.data)
    }

    navigator.serviceWorker.addEventListener('message', handler)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handler)
    }
  })

  // Sub to push
  const subscribe = useCallback(async () => {
    if (!isSupported) return

    const perm = await Notification.requestPermission()
    setPermission(perm)

    if (perm !== 'granted') return

    const registration = await navigator.serviceWorker.ready

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    })

    await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/notifications/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub),
      }
    )
  }, [isSupported])

  return {
    isSupported,
    permission,
    subscribe,
  }
}
