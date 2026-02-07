import type { PushSubscriptionDTO, Notification } from './schema/index.js'

export const notifications: Notification[] = []

export const sseClients = new Set<import('express').Response>()

export const pushSubscriptions: PushSubscriptionDTO[] = []
