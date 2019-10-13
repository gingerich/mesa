import { BaseTransport } from './base'

export class PubSubTransport extends BaseTransport {
  subscribe() {
    throw new Error('Not Implemented')
  }

  publish() {
    throw new Error('Not Implemented')
  }

  subscribeToTopics() {
    const { nodeID } = this.transit.broker
    const topics = [
      { nodeID, type: Packet.PACKET_REQUEST },
      { nodeID, type: Packet.PACKET_RESPONSE }
    ]
    const subscriptions = topics.map(topic =>
      this.subscribe(topic.nodeID, topic.type)
    )
    return Promise.all(subscriptions).then(() => true)
  }

  getTopicName(nodeID, type) {
    const { topicPrefix: prefix, topicNameDelimiter: delimiter } = this.options
    return [prefix, nodeID, type].filter(Boolean).join(delimiter)
  }

  getTypeFromTopic(topic) {
    return topic.split(topicNameDelimiter)[2]
  }
}
