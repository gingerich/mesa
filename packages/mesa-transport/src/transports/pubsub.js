import { BaseTransport } from './base'
import Packet from '../packet'

const defaultOptions = {
  topicPrefix: 'MESA',
  topicNameDelimiter: '.',
  topicTypes: [Packet.PACKET_REQUEST, Packet.PACKET_RESPONSE]
}

export class PubSubTransport extends BaseTransport {
  constructor(transit, options) {
    super(transit, { ...defaultOptions, ...options })
  }

  init(client, connection) {
    this.client = client
    this.connection = connection
  }

  subscribe() {
    throw new Error('Not Implemented')
  }

  publish() {
    throw new Error('Not Implemented')
  }

  get topicsToSubscribe() {
    const connectionTopic = this.getTopicFromConnection()
    if (connectionTopic) {
      return [connectionTopic]
    }

    const { topicTypes } = this.options
    const { serviceName } = this.connection
    const mesaTopic = serviceName || this.transit.service.name
    return topicTypes.map(type => ({ id: mesaTopic, type }))
  }

  subscribeToTopics() {
    const subscriptions = this.topicsToSubscribe.map(({ id, type }) =>
      this.subscribe(id, type)
    )
    return Promise.all(subscriptions).then(() => true)
  }

  getTopicName(id, type) {
    const { topicPrefix, topicNameDelimiter } = this.options
    return [topicPrefix, type, id].filter(Boolean).join(topicNameDelimiter)
  }

  getTypeFromTopic(topic) {
    return topic.split(this.options.topicNameDelimiter)[1]
  }

  getTopicFromConnection() {
    return (this.connection.hash && this.connection.hash.slice(1)) || null
  }

  getResponsePublisher(messageHandler) {
    return (data, type) =>
      messageHandler(data, type).then(packet => {
        if (Packet.isResponse(packet)) {
          return this.publish(packet)
        }
      })
  }
}
