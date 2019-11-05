import pull from 'pull-stream'
import { PubSubTransport } from '@mesa/transport'

export default class Transport extends PubSubTransport {
  init(sbot, connection) {
    super.init(sbot, connection)
    this.sbot = sbot // alias for this.client
    this.subscribeToTopics()
    // this.subscribe()
  }

  subscribe(target, type) {
    const topic = this.getTopicName(target, type)

    pull(
      this.sbot.messagesByType({
        type: topic,
        live: true
      }),
      // this.sbot.createLogStream({ live: true }),

      // Ignore the messages we published (prevents recursive effect)
      // pull.filter(msg => {
      //   const self = this.sbot.whoami()
      //   return msg.value && msg.value.author !== self.id
      // }),
      pull.through(data => {
        console.log('data', data)
      }),

      pull.filter(msg => !!msg.value), // && msg.value.author !== this.sbot.id),

      pull.drain(msg => {
        console.log('INCOMING', msg)

        // TODO assert msg.value.author !== this.sbot.id

        // Normalize JSON string to a buffer
        const payload = msg.value.content
        const data = Buffer.from(payload.data)

        this.sbot.emit('mesa:message', data, payload.type)
      })
    )
  }

  publish(packet) {
    return new Promise((resolve, reject) => {
      const topic = this.getTopicName(packet.target, packet.type)
      setTimeout(() => {
        this.sbot.publish(
          {
            type: topic,
            data: packet.payload.toString()
          },
          (err, result) => {
            console.log('PUBLISHED', result)
            if (err) return reject(err)
            resolve(result)
          }
        )
      }, 2000)
    })
  }

  ingress(service) {
    const handleIncomingMessage = this.getResponsePublisher(
      this.getMessageHandler(service)
    )

    this.sbot.on('mesa:message', (data, type) => {
      handleIncomingMessage(data, type)
    })
  }

  egress(service) {
    service.use(ctx => this.publish(ctx.packet))
  }
}
