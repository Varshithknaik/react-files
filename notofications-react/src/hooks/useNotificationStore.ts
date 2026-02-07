import { useQuery, useQueryClient } from '@tanstack/react-query'
import type z from 'zod'
import {
  NotificationStoreSchema,
  type Notifications,
  type NotificationStore,
} from '../schema/notifications.schema'
import { useCallback } from 'react'
import { BASE_URL } from '../config'

export const withSchemaSelectStrict = <S extends z.ZodTypeAny>(schema: S) => {
  return (data: unknown): z.infer<S> => {
    const parsed = schema.safeParse(data)

    if (!parsed.success) {
      console.error('Invalid data:', parsed.error)
      throw new Error('Invalid data')
    }
    return parsed.data
  }
}

export const useNotificationStore = () => {
  const queryClient = useQueryClient()

  const query = useQuery<NotificationStore>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/notifications`)
      return response.json()
    },
    select: withSchemaSelectStrict(NotificationStoreSchema),
  })

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

  const markAsRead = (id: string) => {
    queryClient.setQueryData<NotificationStore>(
      ['notifications'],
      (old = []) => {
        return old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      }
    )
  }

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    upsert,
    markAsRead,
  }
}
