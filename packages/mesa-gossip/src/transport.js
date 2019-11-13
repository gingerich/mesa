import { once } from 'events'
import { PubSubTransport } from '@mesa/transport'

export default class Transport extends PubSubTransport {
  init(instance, connection) {
    super.init(instance, connection)
    this.instance = instance // alias for this.client
    this.ready = once(this.instance, 'up').then(() => this.subscribeToTopics())
    // this.subscribe()
  }

  subscribe(target, type) {
    const topic = this.getTopicName(target, type)

    const onMessage = (msg, cb) => {
      const data = Buffer.from(msg.data)
      this.instance.emit('mesa:message', data, type)
      cb()
    }

    return new Promise((resolve, reject) => {
      this.instance.pubsub.on(topic, onMessage, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  publish(packet) {
    return new Promise((resolve, reject) => {
      const topic = this.getTopicName(packet.target, packet.type)
      const msg = {
        topic,
        data: packet.payload.toString()
      }
      this.instance.pubsub.emit(msg, (err, result) => {
        console.log('PUBLISHED', err, result)
        resolve()
      })
    })
  }

  ingress(service) {
    const handleIncomingMessage = this.getResponsePublisher(
      this.getMessageHandler(service)
    )

    this.instance.on('mesa:message', (data, type) => {
      handleIncomingMessage(data, type)
    })

    return this.ready
  }

  egress(service) {
    service.use(ctx => this.publish(ctx.packet))
    return this.ready
  }
}
