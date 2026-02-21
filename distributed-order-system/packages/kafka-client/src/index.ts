import { Kafka, Partitioners, Producer, Consumer } from 'kafkajs'
export class KafkaClient {
  private kafka: Kafka
  constructor(clientId: string, brokers: string[]) {
    this.kafka = new Kafka({ clientId, brokers })
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
