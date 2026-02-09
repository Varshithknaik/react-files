import { useQueryClient } from '@tanstack/react-query'
import {
  type Notifications,
  type NotificationStore,
} from '../schema/notifications.schema'
import { useCallback } from 'react'
import { useGetNotifications, useMarkAsRead } from '../app/api/notification.api'

export const useNotificationStore = () => {
  const queryClient = useQueryClient()

  const query = useGetNotifications()
  const { mutate: markAsRead, isPending: isMarkAsReadPending } = useMarkAsRead()

  const upsert = useCallback(
    (notification: Notifications) => {
      queryClient.setQueryData<NotificationStore>(
        ['notifications'],
        (old = []) => {
          const existing = old.find((n) => n.id === notification.id)

          if (existing) {
            return old.map((n) => (n.id === notification.id ? notification : n))
          }

          return [...old, notification]
        }
      )
    },
    [queryClient]
  )

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isMarkAsReadPending: isMarkAsReadPending,
    upsert,
    markAsRead,
  }
}
