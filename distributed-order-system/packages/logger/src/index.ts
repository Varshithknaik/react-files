import winston from 'winston'

const isProd = process.env.NODE_ENV === 'production'

const prodFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.errors(),
  winston.format.json()
)

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}] ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`
  })
)

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
})
