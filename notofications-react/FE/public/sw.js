self.addEventListener('push', (event) => {
  const notification = event.data.json()

  event.waitUntil(
    (async () => {
      const clientList = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      let showNotification = false

      for (const client of clientList) {
        client.postMessage(notification)
        if (client.visibilityState === 'visible') {
          showNotification = true
        }
      }

      if (!showNotification) {
        await self.registration.showNotification('message', {
          body: notification.body,
          data: notification,
        })
      }
    })()
  )
})
