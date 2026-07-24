# Phase 3 LLD: API Gateway Real-Time Collaboration, SSE, WebRTC, Whiteboard, and Better Checkout

> Project: Distributed Order System / OMS Monorepo  
> Scope: API Gateway owned personal collaboration backend, real-time notifications, WebRTC signaling, Excalidraw-style whiteboard, service health, and a stronger create-order experience  
> Audience: Learning-first builder who wants to become strong in WebSocket, WebRTC, SSE, connection management, and fanout

---

## 1. Why This LLD Exists

The original `docs/lld.md` describes separate services for chat, video, and whiteboard:

- `chat-service`
- `video-service`
- `whiteboard-service`

The newer `docs/inventory_saga_lld.md` moves real-time user-facing push into the API Gateway using SSE.

For this project stage, the better learning path is:

1. Keep personal chat, WebRTC signaling, and whiteboard collaboration inside the API Gateway.
2. Use SSE for server-to-browser notifications.
3. Use WebSocket for browser-to-browser collaboration fanout through the Gateway.
4. Keep WebRTC media peer-to-peer. The Gateway only passes signaling messages.
5. Make Service Health understandable by starting with simple probes and connection stats.
6. Improve Create Order so it feels like a real operational checkout flow.

This gives you one place to learn connection management deeply before splitting into separate services.

---

## 2. Final Architecture for This Phase

```text
Browser
  |
  | HTTP REST
  | - login/register
  | - cart
  | - create order
  | - query products/orders
  |
  | SSE
  | - order status notifications
  | - projection lag updates
  | - low-stock alerts
  | - service health changes
  |
  | WebSocket
  | - personal chat
  | - room presence
  | - WebRTC signaling
  | - whiteboard collaboration
  v
API Gateway :4000
  |
  | gRPC
  | - create order
  | - cancel order
  | - inventory commands
  v
Order Service / Inventory Service
  |
  | Kafka events through outbox
  v
Read Service projections
  |
  | HTTP query API, proxied by Gateway
  v
API Gateway -> Browser
```

Important decision:

> Chat, WebRTC signaling, and whiteboard backend state stay inside API Gateway for now. Do not create `chat-service`, `video-service`, or `whiteboard-service` yet.

Why:

- It keeps the learning loop small.
- Auth is already in the Gateway.
- Personal chat is user-level state, not core OMS state.
- WebRTC signaling is not media transport, so it is lightweight.
- Whiteboard events are easier to reason about while the app is single-node.

Later, if you need scale, split these out or put Redis Pub/Sub between Gateway instances.

---

## 3. Real-Time Mental Model

### 3.1 HTTP REST

Use HTTP when the browser asks for something and expects one response.

Good for:

- Login
- Add to cart
- Create order
- Cancel order
- Fetch products
- Fetch orders
- Fetch service health snapshot

Bad for:

- Live chat messages
- Cursor movement
- Whiteboard drawing
- WebRTC offer/answer exchange

### 3.2 SSE

SSE means Server-Sent Events.

It is one-way:

```text
Server -> Browser
```

Use SSE when the server wants to push updates to the browser.

Good for:

- Order status changed
- Projection is now updated
- Low-stock alert
- Service health changed
- "Your checkout completed" notification

Not good for:

- Chat input
- WebRTC signaling
- Whiteboard drawing

Why not use only SSE for everything?

Because the browser cannot send messages back on an SSE connection. You would need HTTP POST for every chat or drawing event. That is okay for low-volume notifications, but clumsy for interactive collaboration.

### 3.3 WebSocket

WebSocket is two-way:

```text
Browser <-> API Gateway
```

Use WebSocket when both sides need to send messages at any time.

Good for:

- Chat
- Presence
- Typing indicators
- Whiteboard cursor movement
- Whiteboard drawing events
- WebRTC signaling

### 3.4 WebRTC

WebRTC is browser-to-browser media/data transport.

```text
Browser A <-> Browser B
```

But before browsers can connect directly, they must exchange:

- Offer SDP
- Answer SDP
- ICE candidates

That exchange is called signaling.

The API Gateway does this:

```text
Browser A -> Gateway -> Browser B
Browser B -> Gateway -> Browser A
```

The API Gateway does not carry video frames. It only carries signaling JSON.

---

## 4. Better Create Order UX

The current create-order idea is too thin if it only asks for SKU and quantity.

The better screen should feel like an operational checkout command center.

### 4.1 Create Order Screen Layout

Use a three-zone layout:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Create Order                                                        │
├───────────────────────┬────────────────────────┬───────────────────┤
│ Product Search         │ Order Basket            │ Stock Preview      │
│ - SKU/name/category    │ - selected items         │ - availability     │
│ - price/offer chips    │ - quantity steppers      │ - reservation risk │
│ - stock status         │ - estimated total        │ - projection note  │
└───────────────────────┴────────────────────────┴───────────────────┘
```

### 4.2 Required Interactions

1. Search products from the read model.
2. Select product into basket.
3. Adjust quantity using a stepper.
4. Show stock status before submit.
5. Disable submit if any item has invalid quantity.
6. On submit, call create order.
7. Immediately show `Order command accepted`.
8. Use SSE to show projection completion when read model catches up.

### 4.3 Create Order API Flow

```text
User clicks Create Order
  |
  v
Frontend validates basket
  |
  v
POST /commands/order
  |
  v
API Gateway validates JWT and payload
  |
  v
orderClient.createOrder({ userId, items })
  |
  v
Order Service reserves stock through Inventory Service
  |
  v
Outbox publishes order/inventory events
  |
  v
Read Service projects OrderView and InventoryView
  |
  v
Gateway sends SSE: ORDER_PROJECTION_READY
```

### 4.4 Better Response Shape

The Gateway should return enough information for the UI to move into a useful pending state.

```typescript
type CreateOrderHttpResponse = {
  orderId: string
  status: 'CONFIRMED'
  projection: {
    state: 'PENDING'
    message: 'Order command succeeded. Waiting for read model projection.'
  }
}
```

### 4.5 Optional Preflight

Add this later, after query APIs exist:

```http
POST /queries/inventory/availability-preview
```

Payload:

```json
{
  "items": [
    { "sku": "SKU-SHO-N27", "quantity": 2 },
    { "sku": "SKU-PHN-13P", "quantity": 1 }
  ]
}
```

Response:

```json
{
  "items": [
    {
      "sku": "SKU-SHO-N27",
      "requested": 2,
      "available": 12,
      "canReserve": true
    }
  ]
}
```

This makes Create Order much stronger without changing the core Order Service.

---

## 5. Service Health You Can Actually Understand

Service Health should not be a fancy fake dashboard. It should answer four questions:

1. Is the service process reachable?
2. Are its dependencies reachable?
3. Is it ready to handle traffic?
4. Are real-time connections healthy?

### 5.1 Health Concepts

| Concept           | Meaning                         | Example                                   |
| ----------------- | ------------------------------- | ----------------------------------------- |
| Liveness          | Is the process alive?           | Gateway responds to `/health`             |
| Readiness         | Can it handle real work?        | Gateway can reach Order gRPC              |
| Dependency health | Are required systems reachable? | Kafka, Postgres, MongoDB                  |
| Realtime health   | Are streams/sockets alive?      | SSE clients, WS rooms, heartbeat failures |

### 5.2 Simple Health UI

Cards:

- API Gateway
- Order Service
- Inventory Service
- Read Service
- Kafka
- Postgres
- MongoDB
- Realtime Connections

Each card:

- Status: `healthy`, `degraded`, `down`
- Last checked
- Latency
- Reason
- What it means

Example:

```json
{
  "name": "Inventory Service",
  "status": "healthy",
  "latencyMs": 12,
  "lastCheckedAt": "2026-07-19T12:00:00.000Z",
  "reason": "gRPC channel responded"
}
```

### 5.3 Gateway Health Aggregator Example

```typescript
// apps/api-gateway/src/health/health.types.ts
export type HealthStatus = 'healthy' | 'degraded' | 'down'

export type HealthCheckResult = {
  name: string
  status: HealthStatus
  latencyMs: number
  checkedAt: string
  reason: string
}
```

```typescript
// apps/api-gateway/src/health/health.service.ts
import { realtimeRegistry } from '../realtime/realtime-registry.js'

type Probe = {
  name: string
  check: () => Promise<string>
}

const withTimer = async (probe: Probe): Promise<HealthCheckResult> => {
  const start = Date.now()

  try {
    const reason = await probe.check()
    return {
      name: probe.name,
      status: 'healthy',
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
      reason,
    }
  } catch (error) {
    return {
      name: probe.name,
      status: 'down',
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
      reason: error instanceof Error ? error.message : 'Unknown failure',
    }
  }
}

export async function getServiceHealth() {
  const probes: Probe[] = [
    {
      name: 'API Gateway',
      check: async () => 'HTTP process is alive',
    },
    {
      name: 'Realtime Connections',
      check: async () => {
        const stats = realtimeRegistry.stats()
        return `${stats.totalConnections} ws clients, ${stats.totalRooms} rooms`
      },
    },
  ]

  return Promise.all(probes.map(withTimer))
}
```

```typescript
// apps/api-gateway/src/routes/health.routes.ts
import { Router } from 'express'
import { sendSuccess } from '../lib/http-response.js'
import { getServiceHealth } from '../health/health.service.js'

export const healthRouter = Router()

healthRouter.get('/service-health', async (_, res) => {
  const checks = await getServiceHealth()
  return sendSuccess(res, 200, 'Service health fetched successfully', checks)
})
```

Learning note:

Start with health checks you can prove. Do not pretend Kafka or gRPC is healthy unless you actually ping it.

---

## 6. API Gateway Real-Time Backend

### 6.1 Proposed Folder Structure

```text
apps/api-gateway/src/
  realtime/
    realtime.types.ts
    realtime-registry.ts
    sse.manager.ts
    ws.server.ts
    ws-message.handler.ts
    room.service.ts
    chat.service.ts
    whiteboard.service.ts
    webrtc-signaling.service.ts
  routes/
    realtime.routes.ts
    health.routes.ts
  schema/
    realtime.schema.ts
```

Install later when implementing:

```bash
npm install ws
npm install -D @types/ws
```

No install is needed for this document.

---

## 7. Core Real-Time Types

```typescript
// apps/api-gateway/src/realtime/realtime.types.ts
import { WebSocket } from 'ws'

export type RealtimeChannel = 'sse' | 'ws'

export type WsClient = {
  connectionId: string
  userId: string
  email: string
  ws: WebSocket
  rooms: Set<string>
  isAlive: boolean
  connectedAt: Date
  lastSeenAt: Date
}

export type ServerEvent<TPayload = unknown> = {
  id: string
  type: string
  payload: TPayload
  occurredAt: string
}

export type ClientEvent =
  | {
      type: 'ROOM_JOIN'
      roomId: string
    }
  | {
      type: 'ROOM_LEAVE'
      roomId: string
    }
  | {
      type: 'CHAT_SEND'
      roomId: string
      clientMessageId: string
      text: string
    }
  | {
      type: 'WEBRTC_SIGNAL'
      roomId: string
      toUserId: string
      signal: WebRtcSignal
    }
  | {
      type: 'WHITEBOARD_EVENT'
      roomId: string
      boardId: string
      clientEventId: string
      operation: WhiteboardOperation
    }

export type WebRtcSignal =
  | { kind: 'offer'; sdp: string }
  | { kind: 'answer'; sdp: string }
  | { kind: 'ice-candidate'; candidate: unknown }

export type WhiteboardOperation =
  | {
      kind: 'element-upsert'
      element: unknown
    }
  | {
      kind: 'element-delete'
      elementId: string
    }
  | {
      kind: 'cursor'
      x: number
      y: number
    }
```

Why these event names?

- They are explicit.
- They separate client intent from server fanout.
- They work for chat, WebRTC, and whiteboard without creating separate services.

---

## 8. Connection Registry and Fanout

The registry is the heart of real-time backend learning.

It must answer:

- Which sockets does this user have open?
- Which users are in this room?
- How do I send to one user?
- How do I broadcast to a room?
- How do I remove a dead connection?

### 8.1 Registry Data Structures

```text
connectionsById
  connectionId -> WsClient

connectionsByUser
  userId -> Set<connectionId>

rooms
  roomId -> Set<connectionId>
```

Use `Set` because:

- A user can open multiple browser tabs.
- A room can have many clients.
- Removing a connection should be cheap.

### 8.2 Registry Example

```typescript
// apps/api-gateway/src/realtime/realtime-registry.ts
import crypto from 'node:crypto'
import { WebSocket } from 'ws'
import { ServerEvent, WsClient } from './realtime.types.js'

class RealtimeRegistry {
  private connectionsById = new Map<string, WsClient>()
  private connectionsByUser = new Map<string, Set<string>>()
  private rooms = new Map<string, Set<string>>()

  addClient(input: { userId: string; email: string; ws: WebSocket }) {
    const connectionId = crypto.randomUUID()
    const client: WsClient = {
      connectionId,
      userId: input.userId,
      email: input.email,
      ws: input.ws,
      rooms: new Set(),
      isAlive: true,
      connectedAt: new Date(),
      lastSeenAt: new Date(),
    }

    this.connectionsById.set(connectionId, client)

    const userConnections =
      this.connectionsByUser.get(input.userId) ?? new Set<string>()
    userConnections.add(connectionId)
    this.connectionsByUser.set(input.userId, userConnections)

    return client
  }

  removeClient(connectionId: string) {
    const client = this.connectionsById.get(connectionId)
    if (!client) return

    this.connectionsById.delete(connectionId)

    const userConnections = this.connectionsByUser.get(client.userId)
    userConnections?.delete(connectionId)
    if (userConnections?.size === 0) {
      this.connectionsByUser.delete(client.userId)
    }

    for (const roomId of client.rooms) {
      const room = this.rooms.get(roomId)
      room?.delete(connectionId)
      if (room?.size === 0) {
        this.rooms.delete(roomId)
      }
    }
  }

  joinRoom(connectionId: string, roomId: string) {
    const client = this.connectionsById.get(connectionId)
    if (!client) return

    client.rooms.add(roomId)

    const room = this.rooms.get(roomId) ?? new Set<string>()
    room.add(connectionId)
    this.rooms.set(roomId, room)
  }

  leaveRoom(connectionId: string, roomId: string) {
    const client = this.connectionsById.get(connectionId)
    client?.rooms.delete(roomId)

    const room = this.rooms.get(roomId)
    room?.delete(connectionId)
    if (room?.size === 0) {
      this.rooms.delete(roomId)
    }
  }

  sendToUser(userId: string, event: ServerEvent) {
    const connectionIds = this.connectionsByUser.get(userId)
    if (!connectionIds) return

    for (const connectionId of connectionIds) {
      this.sendToConnection(connectionId, event)
    }
  }

  broadcastRoom(
    roomId: string,
    event: ServerEvent,
    options: { exceptConnectionId?: string } = {}
  ) {
    const room = this.rooms.get(roomId)
    if (!room) return

    for (const connectionId of room) {
      if (connectionId === options.exceptConnectionId) continue
      this.sendToConnection(connectionId, event)
    }
  }

  sendToConnection(connectionId: string, event: ServerEvent) {
    const client = this.connectionsById.get(connectionId)
    if (!client || client.ws.readyState !== WebSocket.OPEN) return

    if (client.ws.bufferedAmount > 1_000_000) {
      client.ws.close(1013, 'Client is too slow')
      return
    }

    client.ws.send(JSON.stringify(event))
  }

  markAlive(connectionId: string) {
    const client = this.connectionsById.get(connectionId)
    if (!client) return

    client.isAlive = true
    client.lastSeenAt = new Date()
  }

  markWaitingForPong() {
    for (const client of this.connectionsById.values()) {
      client.isAlive = false
      client.ws.ping()
    }
  }

  terminateDeadConnections() {
    for (const client of this.connectionsById.values()) {
      if (client.isAlive) continue
      client.ws.terminate()
      this.removeClient(client.connectionId)
    }
  }

  stats() {
    return {
      totalConnections: this.connectionsById.size,
      totalUsers: this.connectionsByUser.size,
      totalRooms: this.rooms.size,
    }
  }
}

export const realtimeRegistry = new RealtimeRegistry()
```

### 8.3 Fanout Rules

| Action                    | Fanout target                     |
| ------------------------- | --------------------------------- |
| Personal chat message     | All connections for receiver user |
| Typing indicator          | Receiver user, but not persisted  |
| Whiteboard element update | Room except sender                |
| Whiteboard cursor         | Room except sender, not persisted |
| WebRTC offer/answer/ICE   | Target user only                  |
| Order status notification | Current user's SSE stream         |
| Low-stock alert           | Operators room or all admin users |

---

## 9. WebSocket Server in API Gateway

Browser WebSocket cannot set an `Authorization` header directly. For local learning, use a token query param:

```text
ws://localhost:4000/realtime/ws?token=<jwt>
```

For production, prefer a short-lived WebSocket token minted over HTTPS.

### 9.1 Attaching WebSocket to Express

```typescript
// apps/api-gateway/src/index.ts
import http from 'node:http'
import express from 'express'
import { attachRealtimeServer } from './realtime/ws.server.js'

const app = express()
const server = http.createServer(app)

attachRealtimeServer(server)

server.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`)
})
```

### 9.2 WebSocket Server Example

```typescript
// apps/api-gateway/src/realtime/ws.server.ts
import http from 'node:http'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import { AuthUser } from '../types/express.js'
import { realtimeRegistry } from './realtime-registry.js'
import { handleWsMessage } from './ws-message.handler.js'

export function attachRealtimeServer(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '', 'http://localhost')
    if (url.pathname !== '/realtime/ws') {
      socket.destroy()
      return
    }

    const token = url.searchParams.get('token')
    if (!token) {
      socket.destroy()
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      if (typeof decoded === 'string') {
        socket.destroy()
        return
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        const user = decoded as AuthUser
        const client = realtimeRegistry.addClient({
          userId: user.id,
          email: user.email,
          ws,
        })

        ws.on('pong', () => realtimeRegistry.markAlive(client.connectionId))
        ws.on('close', () => realtimeRegistry.removeClient(client.connectionId))
        ws.on('message', (raw) => handleWsMessage(client, raw.toString()))
      })
    } catch {
      socket.destroy()
    }
  })

  setInterval(() => {
    realtimeRegistry.terminateDeadConnections()
    realtimeRegistry.markWaitingForPong()
  }, 30_000)
}
```

Learning note:

The heartbeat loop is not decoration. Without it, dead browser tabs, Wi-Fi changes, and sleeping laptops leave stale connections in memory.

---

## 10. SSE Manager

Use SSE for one-way server push.

Important SSE details:

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- Send heartbeats so proxies do not close idle streams.
- Clean up on `req.close`.
- Support multiple tabs per user.

### 10.1 SSE Manager Example

```typescript
// apps/api-gateway/src/realtime/sse.manager.ts
import crypto from 'node:crypto'
import { Response } from 'express'
import { ServerEvent } from './realtime.types.js'

type SseClient = {
  connectionId: string
  userId: string
  res: Response
  heartbeat: NodeJS.Timeout
}

class SseManager {
  private clientsById = new Map<string, SseClient>()
  private clientsByUser = new Map<string, Set<string>>()

  addClient(userId: string, res: Response) {
    const connectionId = crypto.randomUUID()

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n')
    }, 20_000)

    const client: SseClient = {
      connectionId,
      userId,
      res,
      heartbeat,
    }

    this.clientsById.set(connectionId, client)

    const userClients = this.clientsByUser.get(userId) ?? new Set<string>()
    userClients.add(connectionId)
    this.clientsByUser.set(userId, userClients)

    this.sendToConnection(connectionId, {
      id: crypto.randomUUID(),
      type: 'STREAM_CONNECTED',
      payload: { connectionId },
      occurredAt: new Date().toISOString(),
    })

    return connectionId
  }

  removeClient(connectionId: string) {
    const client = this.clientsById.get(connectionId)
    if (!client) return

    clearInterval(client.heartbeat)
    this.clientsById.delete(connectionId)

    const userClients = this.clientsByUser.get(client.userId)
    userClients?.delete(connectionId)
    if (userClients?.size === 0) {
      this.clientsByUser.delete(client.userId)
    }
  }

  sendToUser(userId: string, event: ServerEvent) {
    const connectionIds = this.clientsByUser.get(userId)
    if (!connectionIds) return

    for (const connectionId of connectionIds) {
      this.sendToConnection(connectionId, event)
    }
  }

  sendToConnection(connectionId: string, event: ServerEvent) {
    const client = this.clientsById.get(connectionId)
    if (!client) return

    client.res.write(`id: ${event.id}\n`)
    client.res.write(`event: ${event.type}\n`)
    client.res.write(`data: ${JSON.stringify(event.payload)}\n\n`)
  }

  stats() {
    return {
      totalSseConnections: this.clientsById.size,
      totalSseUsers: this.clientsByUser.size,
    }
  }
}

export const sseManager = new SseManager()
```

### 10.2 SSE Route Example

```typescript
// apps/api-gateway/src/routes/realtime.routes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { sseManager } from '../realtime/sse.manager.js'

export const realtimeRouter = Router()

realtimeRouter.get('/stream', authMiddleware, (req, res) => {
  const connectionId = sseManager.addClient(req.user!.id, res)

  req.on('close', () => {
    sseManager.removeClient(connectionId)
  })
})
```

Browser note:

Native `EventSource` cannot send custom `Authorization` headers. Since this project currently uses JWT bearer headers, pick one of these:

1. Use cookie-based auth for SSE.
2. Use a short-lived stream token in the query string.
3. Use a fetch-based SSE client library later.

For local learning, option 2 is acceptable if the token is short-lived.

---

## 11. Personal Chat in API Gateway Only

### 11.1 Scope

Build direct personal chat first:

- User A sends message to User B.
- Message is persisted in API Gateway PostgreSQL.
- If User B is online, fanout over WebSocket.
- If User B is offline, message is still available through HTTP history.

Do not put chat into Kafka yet.

Why:

- Chat is not part of order consistency.
- Chat does not need the read-service projection pattern yet.
- You need to learn connection routing before distributed fanout.

### 11.2 Prisma Models

Add to `apps/api-gateway/prisma/schema.prisma` later:

```prisma
enum ConversationKind {
  DIRECT
}

model Conversation {
  id        String             @id @default(cuid())
  kind      ConversationKind   @default(DIRECT)
  members   ConversationMember[]
  messages  ChatMessage[]
  createdAt DateTime           @default(now()) @map("created_at")
  updatedAt DateTime           @updatedAt @map("updated_at")

  @@map("conversations")
}

model ConversationMember {
  id             String       @id @default(cuid())
  conversationId String       @map("conversation_id")
  userId         String       @map("user_id")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           Users        @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt       DateTime     @default(now()) @map("joined_at")

  @@unique([conversationId, userId])
  @@index([userId])
  @@map("conversation_members")
}

model ChatMessage {
  id                String       @id @default(cuid())
  conversationId    String       @map("conversation_id")
  senderId          String       @map("sender_id")
  clientMessageId   String       @map("client_message_id")
  text              String
  createdAt         DateTime     @default(now()) @map("created_at")
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender            Users        @relation(fields: [senderId], references: [id])

  @@unique([senderId, clientMessageId])
  @@index([conversationId, createdAt])
  @@map("chat_messages")
}
```

Also update `Users` later:

```prisma
model Users {
  id                    String               @id @default(cuid())
  email                 String               @unique
  name                  String?
  conversationMembers   ConversationMember[]
  chatMessages          ChatMessage[]
}
```

### 11.3 Chat Message Handler

```typescript
// apps/api-gateway/src/realtime/chat.service.ts
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { realtimeRegistry } from './realtime-registry.js'
import { WsClient } from './realtime.types.js'

export async function sendChatMessage(input: {
  client: WsClient
  conversationId: string
  clientMessageId: string
  text: string
}) {
  const membership = await prisma.conversationMember.findFirst({
    where: {
      conversationId: input.conversationId,
      userId: input.client.userId,
    },
  })

  if (!membership) {
    throw new Error('User is not a member of this conversation')
  }

  const message = await prisma.chatMessage.create({
    data: {
      conversationId: input.conversationId,
      senderId: input.client.userId,
      clientMessageId: input.clientMessageId,
      text: input.text,
    },
  })

  const members = await prisma.conversationMember.findMany({
    where: { conversationId: input.conversationId },
  })

  for (const member of members) {
    realtimeRegistry.sendToUser(member.userId, {
      id: crypto.randomUUID(),
      type: 'CHAT_MESSAGE',
      payload: {
        conversationId: input.conversationId,
        messageId: message.id,
        senderId: input.client.userId,
        text: input.text,
        createdAt: message.createdAt.toISOString(),
      },
      occurredAt: new Date().toISOString(),
    })
  }
}
```

Idempotency note:

`clientMessageId` prevents duplicate messages if the browser retries after reconnect.

---

## 12. WebRTC Signaling

### 12.1 What Gateway Does

The Gateway only routes signaling payloads.

It does not:

- Store video.
- Decode media.
- Transcode media.
- Proxy video frames.

It does:

- Authenticate users.
- Check both users are allowed in the room.
- Forward offer, answer, and ICE candidates.
- Notify caller if target is offline.

### 12.2 WebRTC Signaling Messages

```json
{
  "type": "WEBRTC_SIGNAL",
  "roomId": "call_ord_8fb124",
  "toUserId": "usr_11029",
  "signal": {
    "kind": "offer",
    "sdp": "v=0..."
  }
}
```

```json
{
  "type": "WEBRTC_SIGNAL",
  "roomId": "call_ord_8fb124",
  "toUserId": "usr_99384",
  "signal": {
    "kind": "ice-candidate",
    "candidate": {
      "candidate": "...",
      "sdpMid": "0",
      "sdpMLineIndex": 0
    }
  }
}
```

### 12.3 Gateway Signaling Handler

```typescript
// apps/api-gateway/src/realtime/webrtc-signaling.service.ts
import crypto from 'node:crypto'
import { realtimeRegistry } from './realtime-registry.js'
import { WebRtcSignal, WsClient } from './realtime.types.js'

export function forwardWebRtcSignal(input: {
  client: WsClient
  roomId: string
  toUserId: string
  signal: WebRtcSignal
}) {
  realtimeRegistry.sendToUser(input.toUserId, {
    id: crypto.randomUUID(),
    type: 'WEBRTC_SIGNAL',
    payload: {
      roomId: input.roomId,
      fromUserId: input.client.userId,
      signal: input.signal,
    },
    occurredAt: new Date().toISOString(),
  })
}
```

### 12.4 Browser Learning Example

```typescript
const peer = new RTCPeerConnection({
  iceServers: [
    {
      urls: import.meta.env.VITE_STUN_URL,
    },
  ],
})

peer.onicecandidate = (event) => {
  if (!event.candidate) return

  ws.send(
    JSON.stringify({
      type: 'WEBRTC_SIGNAL',
      roomId,
      toUserId,
      signal: {
        kind: 'ice-candidate',
        candidate: event.candidate,
      },
    })
  )
}

async function startCall() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  })

  for (const track of stream.getTracks()) {
    peer.addTrack(track, stream)
  }

  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)

  ws.send(
    JSON.stringify({
      type: 'WEBRTC_SIGNAL',
      roomId,
      toUserId,
      signal: {
        kind: 'offer',
        sdp: offer.sdp,
      },
    })
  )
}
```

Learning note:

If WebRTC feels mysterious, remember this:

- WebSocket helps peers find each other.
- WebRTC carries the actual audio/video.
- STUN/TURN helps peers connect across networks.

---

## 13. Excalidraw-Style Whiteboard

### 13.1 Goal

Create a shared whiteboard where multiple users can draw, move elements, and see cursors in real time.

For frontend, later use:

```text
@excalidraw/excalidraw
```

For backend, keep it API Gateway only.

### 13.2 Whiteboard State Model

For learning, use both:

- Event log for debugging and replay.
- Periodic snapshot for fast room join.

```prisma
model WhiteboardBoard {
  id          String             @id @default(cuid())
  title       String
  ownerId     String             @map("owner_id")
  snapshot    Json?
  version     Int                @default(0)
  events      WhiteboardEvent[]
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")

  @@index([ownerId])
  @@map("whiteboard_boards")
}

model WhiteboardEvent {
  id             String          @id @default(cuid())
  boardId        String          @map("board_id")
  senderId       String          @map("sender_id")
  clientEventId  String          @map("client_event_id")
  sequence       Int
  operation      Json
  createdAt      DateTime        @default(now()) @map("created_at")
  board          WhiteboardBoard @relation(fields: [boardId], references: [id], onDelete: Cascade)

  @@unique([senderId, clientEventId])
  @@index([boardId, sequence])
  @@map("whiteboard_events")
}
```

### 13.3 Whiteboard Event Types

```typescript
type WhiteboardServerEvent =
  | {
      type: 'WHITEBOARD_SNAPSHOT'
      payload: {
        boardId: string
        version: number
        elements: unknown[]
      }
    }
  | {
      type: 'WHITEBOARD_EVENT'
      payload: {
        boardId: string
        sequence: number
        operation: WhiteboardOperation
      }
    }
  | {
      type: 'WHITEBOARD_CURSOR'
      payload: {
        boardId: string
        userId: string
        x: number
        y: number
      }
    }
```

### 13.4 Whiteboard Handler

```typescript
// apps/api-gateway/src/realtime/whiteboard.service.ts
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { realtimeRegistry } from './realtime-registry.js'
import { WhiteboardOperation, WsClient } from './realtime.types.js'

export async function handleWhiteboardEvent(input: {
  client: WsClient
  roomId: string
  boardId: string
  clientEventId: string
  operation: WhiteboardOperation
}) {
  if (input.operation.kind === 'cursor') {
    realtimeRegistry.broadcastRoom(
      input.roomId,
      {
        id: crypto.randomUUID(),
        type: 'WHITEBOARD_CURSOR',
        payload: {
          boardId: input.boardId,
          userId: input.client.userId,
          x: input.operation.x,
          y: input.operation.y,
        },
        occurredAt: new Date().toISOString(),
      },
      { exceptConnectionId: input.client.connectionId }
    )
    return
  }

  const result = await prisma.$transaction(async (tx) => {
    const board = await tx.whiteboardBoard.update({
      where: { id: input.boardId },
      data: { version: { increment: 1 } },
    })

    const event = await tx.whiteboardEvent.create({
      data: {
        boardId: input.boardId,
        senderId: input.client.userId,
        clientEventId: input.clientEventId,
        sequence: board.version,
        operation: input.operation,
      },
    })

    return { board, event }
  })

  realtimeRegistry.broadcastRoom(
    input.roomId,
    {
      id: crypto.randomUUID(),
      type: 'WHITEBOARD_EVENT',
      payload: {
        boardId: input.boardId,
        sequence: result.event.sequence,
        operation: input.operation,
      },
      occurredAt: new Date().toISOString(),
    },
    { exceptConnectionId: input.client.connectionId }
  )
}
```

### 13.5 Frontend Excalidraw Integration Shape

```typescript
function sendSceneChange(elements: readonly unknown[]) {
  ws.send(
    JSON.stringify({
      type: 'WHITEBOARD_EVENT',
      roomId,
      boardId,
      clientEventId: crypto.randomUUID(),
      operation: {
        kind: 'element-upsert',
        element: elements,
      },
    })
  )
}
```

Important optimization:

Do not send a whiteboard event on every mouse pixel. Debounce scene changes, and send cursor movement separately at a lower rate.

Recommended rates:

| Data            | Rate                         |
| --------------- | ---------------------------- |
| Cursor position | 10 to 15 times per second    |
| Scene updates   | Debounced every 150 to 300ms |
| Snapshot save   | Every 20 to 50 events        |

---

## 14. WebSocket Message Handler

```typescript
// apps/api-gateway/src/realtime/ws-message.handler.ts
import crypto from 'node:crypto'
import { realtimeRegistry } from './realtime-registry.js'
import { sendChatMessage } from './chat.service.js'
import { forwardWebRtcSignal } from './webrtc-signaling.service.js'
import { handleWhiteboardEvent } from './whiteboard.service.js'
import { ClientEvent, WsClient } from './realtime.types.js'

export async function handleWsMessage(client: WsClient, raw: string) {
  let message: ClientEvent

  try {
    message = JSON.parse(raw) as ClientEvent
  } catch {
    realtimeRegistry.sendToConnection(client.connectionId, {
      id: crypto.randomUUID(),
      type: 'ERROR',
      payload: { message: 'Invalid JSON message' },
      occurredAt: new Date().toISOString(),
    })
    return
  }

  if (message.type === 'ROOM_JOIN') {
    realtimeRegistry.joinRoom(client.connectionId, message.roomId)
    realtimeRegistry.broadcastRoom(message.roomId, {
      id: crypto.randomUUID(),
      type: 'PRESENCE_JOINED',
      payload: {
        roomId: message.roomId,
        userId: client.userId,
      },
      occurredAt: new Date().toISOString(),
    })
    return
  }

  if (message.type === 'ROOM_LEAVE') {
    realtimeRegistry.leaveRoom(client.connectionId, message.roomId)
    return
  }

  if (message.type === 'CHAT_SEND') {
    await sendChatMessage({
      client,
      conversationId: message.roomId,
      clientMessageId: message.clientMessageId,
      text: message.text,
    })
    return
  }

  if (message.type === 'WEBRTC_SIGNAL') {
    forwardWebRtcSignal({
      client,
      roomId: message.roomId,
      toUserId: message.toUserId,
      signal: message.signal,
    })
    return
  }

  if (message.type === 'WHITEBOARD_EVENT') {
    await handleWhiteboardEvent({
      client,
      roomId: message.roomId,
      boardId: message.boardId,
      clientEventId: message.clientEventId,
      operation: message.operation,
    })
  }
}
```

Production note:

This example needs Zod validation before real implementation. Do not trust client JSON.

---

## 15. Connection Keep-Alive Rules

### 15.1 WebSocket Keep-Alive

Server:

- Every 30 seconds, set `isAlive = false`.
- Send WebSocket ping.
- If no pong arrives before next cycle, terminate.

Browser:

- Reconnect after close.
- Use exponential backoff.
- Rejoin rooms after reconnect.
- Resend pending messages with the same `clientMessageId`.

### 15.2 SSE Keep-Alive

Server:

- Send `: heartbeat\n\n` every 20 seconds.
- Clean up on `req.close`.
- Use event `id` so clients can resume later.

Browser:

- Native EventSource reconnects automatically.
- If using fetch-based SSE, implement retry manually.

### 15.3 Backpressure

Backpressure means the server is sending faster than the client can receive.

In Node `ws`, check:

```typescript
if (client.ws.bufferedAmount > 1_000_000) {
  client.ws.close(1013, 'Client is too slow')
}
```

This matters for whiteboards because drawing can create many messages.

---

## 16. API Route Summary

### 16.1 Existing Routes

| Route                               | Method  | Purpose              |
| ----------------------------------- | ------- | -------------------- |
| `/user/register`                    | `POST`  | Create user          |
| `/user/login`                       | `POST`  | Login and return JWT |
| `/commands/order`                   | `POST`  | Create order         |
| `/commands/order/cancel/:orderId`   | `PATCH` | Cancel order         |
| `/commands/inventory/products`      | `POST`  | Add inventory        |
| `/commands/inventory/products/bulk` | `POST`  | Bulk add inventory   |
| `/commands/inventory/products/:sku` | `PATCH` | Update inventory     |

### 16.2 New REST Routes

| Route                                | Method | Purpose                              |
| ------------------------------------ | ------ | ------------------------------------ |
| `/realtime/stream`                   | `GET`  | SSE connection                       |
| `/realtime/token`                    | `POST` | Optional short-lived stream/ws token |
| `/collab/conversations`              | `POST` | Create or fetch direct conversation  |
| `/collab/conversations/:id/messages` | `GET`  | Fetch chat history                   |
| `/collab/whiteboards`                | `POST` | Create whiteboard                    |
| `/collab/whiteboards/:id`            | `GET`  | Fetch whiteboard snapshot            |
| `/health/service-health`             | `GET`  | Aggregated health cards              |

### 16.3 New WebSocket Endpoint

```http
GET /realtime/ws?token=<jwt>
Upgrade: websocket
```

Message types:

| Client -> Gateway  | Purpose                        |
| ------------------ | ------------------------------ |
| `ROOM_JOIN`        | Join chat/call/whiteboard room |
| `ROOM_LEAVE`       | Leave room                     |
| `CHAT_SEND`        | Send chat message              |
| `WEBRTC_SIGNAL`    | Send offer/answer/ICE          |
| `WHITEBOARD_EVENT` | Send draw/cursor event         |

| Gateway -> Client     | Purpose                           |
| --------------------- | --------------------------------- |
| `PRESENCE_JOINED`     | User joined room                  |
| `PRESENCE_LEFT`       | User left room                    |
| `CHAT_MESSAGE`        | New chat message                  |
| `WEBRTC_SIGNAL`       | Incoming offer/answer/ICE         |
| `WHITEBOARD_SNAPSHOT` | Current board state               |
| `WHITEBOARD_EVENT`    | Board element update              |
| `WHITEBOARD_CURSOR`   | Live cursor update                |
| `ERROR`               | Invalid event or permission issue |

---

## 17. Frontend Learning UX

The UI should help you learn the protocols, not hide them.

### 17.1 Real-Time Navigation

Use separate top-level pages instead of one overloaded collaboration page:

1. `Chat + Video`
2. `Whiteboard`

Why:

- Chat and video share conversation rooms, participants, and WebRTC signaling.
- Whiteboard needs a larger canvas, tools, layers, snapshots, and board-specific event inspection.
- Separating them makes the learning surface clearer.

### 17.2 Chat + Video UI

Left:

- Conversation list
- Online/offline dot
- Direct and group room badges
- Unread count
- Room member count

Center:

- Message thread
- Delivery state
- Retry indicator
- Group chat message composer
- Fanout explanation for room broadcast

Right:

- Local video
- Remote video
- Mute/camera/share controls
- WebRTC signaling timeline:
  - offer sent
  - answer received
  - ICE candidate sent
  - ICE candidate received
  - peer connected
- Connection inspector:
  - WebSocket status
  - connection id
  - joined rooms
  - last pong
  - buffered amount
  - reconnect count

### 17.3 Whiteboard UI

Left:

- Tool palette
- Select
- Pen
- Rectangle
- Arrow
- Text
- Sticky note
- Eraser
- Send-rate hints

Main:

- Excalidraw canvas
- Board title
- Board room id
- Sync status
- Live cursors
- Shapes and arrows

Right:

- Connected users
- Live cursors
- Last event sequence
- Snapshot version
- Layers
- Whiteboard event timeline
- Fanout target explanation

### 17.4 Connection Inspector

Show:

- SSE status
- WebSocket status
- WebRTC peer status
- Current rooms
- Last heartbeat
- Last pong
- Buffered amount
- Reconnect attempts

The Chat + Video page owns the main connection inspector. The Whiteboard page owns a board inspector focused on board version, cursor events, persisted scene events, and snapshots.

---

## 18. How to Keep This Single-Node First

For learning, assume one API Gateway instance.

What works:

- In-memory WebSocket registry.
- In-memory SSE registry.
- Room fanout using Maps and Sets.
- Personal chat persisted in Gateway Postgres.
- Whiteboard event log persisted in Gateway Postgres.

What breaks when you scale to multiple Gateway instances:

- User A may connect to Gateway instance 1.
- User B may connect to Gateway instance 2.
- Instance 1 cannot directly see instance 2's WebSocket map.

Later scale options:

| Option                                  | Use when                                    |
| --------------------------------------- | ------------------------------------------- |
| Sticky sessions                         | Small deployment, simple LB support         |
| Redis Pub/Sub                           | Multiple Gateway instances with live fanout |
| Kafka topic for collaboration           | You want durable collaboration events       |
| Separate chat/video/whiteboard services | You want independent scaling and ownership  |

Do not start there. Learn the single-node model first.

---

## 19. Implementation Order

### Session 1: Service Health and Better Create Order

1. Add `GET /health/service-health`.
2. Add realtime stats stub even before WebSocket exists.
3. Improve Create Order UI wireframe:
   - product search
   - basket
   - stock preview
   - projection pending state

### Session 2: SSE Notifications

1. Add `sse.manager.ts`.
2. Add `GET /realtime/stream`.
3. Send `STREAM_CONNECTED`.
4. Send manual test notification.
5. Connect frontend and show event log.

### Session 3: WebSocket Registry

1. Add `ws` dependency.
2. Attach WebSocket server to Gateway HTTP server.
3. Implement connection registry.
4. Implement heartbeat.
5. Add connection inspector UI.

### Session 4: Personal Chat

1. Add conversation/message Prisma models.
2. Add direct conversation routes.
3. Implement `CHAT_SEND`.
4. Persist messages.
5. Fanout to all online receiver tabs.

### Session 5: WebRTC Signaling

1. Implement `WEBRTC_SIGNAL`.
2. Build local/remote video UI.
3. Show signaling timeline.
4. Add reconnect/failed states.

### Session 6: Whiteboard

1. Add whiteboard Prisma models.
2. Add board create/fetch routes.
3. Integrate Excalidraw.
4. Broadcast cursor and scene events.
5. Add snapshot/version display.

---

## 20. Common Mistakes

### Mistake 1: Treating WebRTC Like WebSocket

WebSocket carries JSON messages through your server.

WebRTC carries media directly between browsers.

The server only helps with signaling.

### Mistake 2: One Connection Per User

A user can open multiple tabs. Use:

```text
userId -> Set<connectionId>
```

Not:

```text
userId -> connection
```

### Mistake 3: No Heartbeat

Without heartbeat, your server thinks dead tabs are still online.

### Mistake 4: Broadcasting Everything to Everyone

Fanout must be targeted.

Do this:

```text
roomId -> room members only
userId -> that user's tabs only
```

Do not send every chat/whiteboard event to every connected user.

### Mistake 5: Persisting Cursor Movement

Do not persist cursor movement. It is temporary presence data.

Persist:

- Chat messages
- Whiteboard element changes
- Whiteboard snapshots

Do not persist:

- Typing indicators
- Cursor positions
- Ping/pong heartbeats

---

## 21. Definition of Done

This phase is done when:

- Create Order has product search, basket, stock preview, and projection pending state.
- Service Health shows meaningful status cards and realtime stats.
- Browser receives SSE heartbeat and notifications.
- Browser opens WebSocket and survives reconnect.
- Personal chat persists messages in API Gateway Postgres.
- WebRTC signaling can establish a local two-browser call.
- Whiteboard can broadcast cursor and element updates.
- Connection Inspector shows SSE, WS, room, heartbeat, and reconnect state.

---

## 22. Recommended Design Update

Update `docs/ui-wireframes.html` later with:

- Replace the current Create Order drawer with a full three-zone Create Order workspace.
- Replace Service Health with real health concepts:
  - liveness
  - readiness
  - dependency checks
  - realtime stats
- Add separate real-time pages:
  - Chat + Video with direct chats, group chats, WebRTC signaling, and connection inspector.
  - Whiteboard with Excalidraw-style canvas, tools, layers, presence, snapshots, and board event inspector.

This keeps the UI aligned with the backend learning goals.
