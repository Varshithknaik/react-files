import dotenv from 'dotenv'
import { logger } from '@core/logger'
import { replayFromOffset } from './events/replay-consumer.js'

dotenv.config({ quiet: true })

const args = process.argv.slice(2)
const parsed: Record<string, string> = {}

args.forEach((arg) => {
  const [key, value] = arg.split('=')
  parsed[key.replace(/^--/, '')] = value
})
const fromOffset = parsed.offset
const partition = parsed.partition ? parseInt(parsed.partition) : undefined
const stopAfter = parsed.stopAfter ? parseInt(parsed.stopAfter) : undefined

if (!fromOffset || partition === undefined) {
  logger.error(
    '[ORDER REPLAY] Partition and offset are required for replayFromOffset'
  )
  process.exit(1)
}

logger.info(
  `[ORDER REPLAY] Starting replay from offset ${fromOffset} on partition ${partition} and stopping after ${stopAfter} messages`
)

const { consumer, done } = await replayFromOffset(
  fromOffset,
  partition,
  stopAfter
).catch((err) => {
  logger.error('[ORDER REPLAY] Failed to replay messages', err)
  process.exit(1)
})

process.on('SIGINT', async () => {
  logger.info('[ORDER REPLAY] SIGINT received, shutting down gracefully...')
  await consumer.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('[ORDER REPLAY] SIGTERM received, shutting down gracefully...')
  await consumer.disconnect()
  process.exit(0)
})

await done

logger.info('[ORDER REPLAY] Replay complete')
process.exit(0)
