import type { Request, Response } from 'express'
import { sseClients } from './store.js'

export const sseHandler = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Con-nection', 'keep-alive')

  res.flushHeaders()
  sseClients.add(res)

  req.on('close', () => {
    sseClients.delete(res)
  })
}

export const broadcastSSE = (data: unknown) => {
  for (const client of sseClients) {
    client.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}

export const heartBeat = () => {
  setInterval(() => {
    for (const client of sseClients) {
      client.write(': ping\n\n')
    }
  }, 25_000)
}
