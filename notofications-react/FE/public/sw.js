self.addEventListener('push', (event) => {
  const notification = event.data.json()

  event.waitUntil(
    (async () => {
      const clientList = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of clientList) {
        client.postMessage(notification)
      }

      console.log(notification)

      await self.registration.showNotification('message', {
        body: notification.body,
        data: notification,
      })
    })()
  )
})
