import { Kafka, Partitioners, type Producer, type Consumer } from 'kafkajs'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

console.log("KAFKA_CA:", process.env.KAFKA_CA , process.env.GATEWAY_PORT);

function resolvePath(p: string) {
  // if running in docker -> path exists like mentioned in env file
  if (fs.existsSync(p)) return p

  return p?.replace('/app', '.')
}

export class KafkaClient {
  private kafka: Kafka
  constructor(clientId: string, brokers: string[]) {
    const caPath = resolvePath(process.env.KAFKA_CA!)
    const certPath = resolvePath(process.env.KAFKA_CERT!)
    const keyPath = resolvePath(process.env.KAFKA_KEY!)

    this.kafka = new Kafka({
      clientId,
      brokers,
      ssl: {
        ca: fs.readFileSync(caPath),
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
        rejectUnauthorized: true,
      },
    })
  }
  createProducer(): Producer {
    return this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    })
  }
  createConsumer(groupId: string): Consumer {
    return this.kafka.consumer({ groupId })
  }
}
