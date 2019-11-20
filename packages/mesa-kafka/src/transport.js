import { PubSubTransport } from '@mesa/transport';

export default class KafkaTransport extends PubSubTransport {
  async ingress(service) {
    const handleIncomingMessage = this.getResponsePublisher(this.getMessageHandler(service));

    this.consumer = this.client.consumer({ groupId: 'test' });
    await this.consumer.connect();
    await this.subscribeToTopics();
    return this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const type = this.getTypeFromTopic(topic);
        handleIncomingMessage({ type, data: message });
      }
    });
  }

  async egress(service) {
    this.producer = this.client.producer();
    await this.producer.connect();

    service.use(ctx => {
      return this.publish(ctx.packet);
    });
  }

  subscribe(target, type) {
    const topic = this.getTopicName(target, type);
    return this.consumer.subscribe({ topic });
  }

  publish(packet) {
    const topic = this.getTopicName(packet.target, packet.type);
    return this.producer.send({
      topic,
      messages: [{ value: packet.payload }]
    });
  }
}
