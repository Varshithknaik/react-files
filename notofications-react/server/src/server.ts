import type { Server } from 'http'
import { sseClients } from './store.js'

export const setupGracefulShutdown = (server: Server) => {
  const shutdown = () => {
    console.log('Shutting down server...')

    for (const client of sseClients) {
      client.end()
    }

    server.close(() => {
      console.log('Server closed.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}
