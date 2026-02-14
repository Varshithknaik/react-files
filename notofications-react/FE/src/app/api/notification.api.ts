import type z from 'zod'
import { BASE_URL } from '../../config'
import {
  NotificationStoreSchema,
  type NotificationStore,
} from '../../schema/notifications.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

export const useGetNotifications = () => {
  return useQuery<NotificationStore>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/notifications`)
      return response.json()
    },
    select: withSchemaSelectStrict(NotificationStoreSchema),
  })
}

export const usePostNotification = () => {
  const queryClient = useQueryClient()

  const createPost = async ({
    title,
    body,
  }: {
    title: string
    body: string
  }) => {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body }),
    })
    if (!response.ok) {
      throw new Error('Failed to create todo')
    }
    return response.json()
  }
  return useMutation({
    mutationFn: createPost,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  const markAsRead = async (id: string) => {
    // For the quick response
    queryClient.setQueryData<NotificationStore>(
      ['notifications'],
      (old = []) => {
        return old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      }
    )
    const response = await fetch(`${BASE_URL}/api/notifications/read/${id}`, {
      method: 'PATCH',
    })
    if (!response.ok) {
      throw new Error('Failed to mark as read')
    }
    return response.json()
  }

  return useMutation({
    mutationFn: markAsRead,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },
  })
}
