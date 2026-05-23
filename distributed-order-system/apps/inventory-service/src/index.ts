import './config/env.js'
import { startInventoryGrpc } from './grpc/server.js'
import { startInventoryOutboxPoller } from './outbox/inventory-outbox-poller.js'

const { shutdown } = await startInventoryGrpc()
const stopOutboxPoller = await startInventoryOutboxPoller()

process.on('SIGINT', () => {
  shutdown()
  stopOutboxPoller()
})
process.on('SIGTERM', () => {
  shutdown()
  stopOutboxPoller()
})
