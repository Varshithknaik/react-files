import { useState } from 'react'
import { useNotificationSSE } from '../hooks/useNotificationSSE'
import { useNotificationPush } from '../hooks/useWebPushSubscription'
import { useNotificationStore } from '../hooks/useNotificationStore'
import { BASE_URL } from '../config'

export const NotificationPlayground = () => {
  // 🔌 real-time wiring
  useNotificationSSE()
  const { subscribe, permission, isSupported } = useNotificationPush()

  // 📦 store
  const { notifications, isLoading, markAsRead } = useNotificationStore()

  // 🧪 local test payload
  const [title, setTitle] = useState('Hello')
  const [body, setBody] = useState('This is a test notification')

  const sendTestNotification = async () => {
    await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    })
  }

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>🔔 Notification Playground</h2>

      {/* Push controls */}
      <section>
        <h4>Push</h4>
        {!isSupported && <p>❌ Push not supported</p>}

        {isSupported && (
          <>
            <p>Permission: {permission}</p>
            <button onClick={subscribe} disabled={permission === 'granted'}>
              Enable Push
            </button>
          </>
        )}
      </section>

      <hr />

      {/* Send test notification */}
      <section>
        <h4>Send Test Notification</h4>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
        />
        <br />

        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="body"
        />
        <br />

        <button onClick={sendTestNotification}>Send Notification</button>
      </section>

      <hr />

      {/* Notification list */}
      <section>
        <h4>Inbox</h4>

        {isLoading && <p>Loading…</p>}

        {!isLoading && notifications.length === 0 && (
          <p>No notifications yet</p>
        )}

        <ul>
          {notifications
            .slice()
            .reverse()
            .map((n) => (
              <li
                key={n.id}
                style={{
                  marginBottom: 12,
                  opacity: n.isRead ? 0.5 : 1,
                }}
              >
                <strong>{n.title}</strong>
                <p>{n?.body ? n.body : 'No body'}</p>
                <small>{n.createdAt.toString()}</small>
                <br />

                {!n.isRead && (
                  <button onClick={() => markAsRead(n.id)}>Mark as read</button>
                )}
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}
