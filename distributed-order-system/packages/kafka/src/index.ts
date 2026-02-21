import { Kafka, Partitioners } from 'kafkajs'

export class KafkaManager {
  private kafka: Kafka

  constructor(clientId: string, brokers: string[]) {
    this.kafka = new Kafka({ clientId, brokers })
  }

  getProducers() {
    return this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    })
  }

  getConsumers(groupId: string) {
    return this.kafka.consumer({
      groupId,
    })
  }
}