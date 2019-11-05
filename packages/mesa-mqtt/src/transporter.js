import { once } from 'events'
import { PubSubTransport } from '@mesa/transport'

export default class MqttTransport extends PubSubTransport {
  init(client, connection) {
    super.init(client, connection)
    const connected = Promise.resolve(
      this.client.connected || once(this.client, 'connect')
    )
    this.ready = connected.then(() => this.subscribeToTopics())
  }

  ingress(service) {
    const handleIncomingMessage = this.getResponsePublisher(
      this.getMessageHandler(service)
    )

    this.client.on('message', async (topic, data) => {
      const type = this.getTypeFromTopic(topic)
      handleIncomingMessage(data, type)
    })

    return this.ready
  }

  egress(service) {
    service.use(ctx => {
      return this.ready.then(() => this.publish(ctx.packet))
    })
  }

  subscribe(target, type) {
    const topic = this.getTopicName(target, type)
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, err => {
        if (err) return reject(err)
        resolve(topic)
      })
    })
  }

  publish(packet) {
    return new Promise((resolve, reject) => {
      const topic = this.getTopicName(packet.target, packet.type)
      this.client.publish(topic, packet.payload, err => {
        if (err) return reject(err)
        resolve(packet)
      })
    })
  }
}
