import { once } from 'events'
import { Packet, PubSubTransport } from '@mesa/transport'

export default class MqttTransport extends PubSubTransport {
  init(client) {
    this.client = client
    const connected = once(this.client, 'connected')
    this.ready = connected.then(() => this.subscribeToTopics())
  }

  ingress(service) {
    const publishCallback = packet => this.publish(packet)
    const handleIncomingMessage = this.getMessageHandler(
      service,
      publishCallback
    )

    this.client.on('message', async (topic, data) => {
      const type = this.getTypeFromTopic(topic)
      const packet = await handleIncomingMessage(data, type)
      if (Packet.isResponse(packet)) {
        this.publish(packet)
      }
    })

    return this.ready
  }

  egress(service) {
    service.use(ctx => {
      return this.ready.then(() => this.publish(ctx.packet))
    })
  }

  subscribe(target) {
    const topic = this.getTopicName(target)
    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  publish(packet) {
    return new Promise((resolve, reject) => {
      const topic = this.getTopicName(packet.target, packet.type)
      this.client.publish(topic, packet.payload, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
