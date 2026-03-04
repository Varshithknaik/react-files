import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  const notification = event.data.json()

  event.waitUntil(
    (async () => {
      const clientList = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      let hasVisibleClient = false

      for (const client of clientList) {
        client.postMessage(notification)
        if (client.visibilityState === 'visible') {
          hasVisibleClient = true
        }
      }

      if (!hasVisibleClient) {
        await self.registration.showNotification('message', {
          body: notification.body,
          data: notification,
        })
      }
    })()
  )
})
