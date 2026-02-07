import { useEffect } from 'react'
import { useNotificatiionStore } from './useNotificationStore'
import { NotificationSchema } from '../schema/notifications.schema'
import { BASE_URL } from '../config'

export const useNotificationSSE = () => {
  const { upsert } = useNotificatiionStore()

  useEffect(() => {
    const source = new EventSource(`${BASE_URL}/api/notifications/sse`)

    source.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)

      const parsed = NotificationSchema.safeParse(data)

      if (!parsed.success) {
        console.error('Invalid data:', parsed.error)
        return
      }

      upsert(data)
    })

    return () => {
      source.close()
    }
  }, [upsert])
}
