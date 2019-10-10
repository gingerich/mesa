// import Packet from '../packet'

const defaultOptions = {
  topicPrefix: 'MESA',
  topicNameDelimiter: '.'
}

export class BaseTransport {
  constructor(transit, options = {}) {
    this.transit = transit
    this.options = { ...defaultOptions, ...options }
  }

  ingress(/* service */) {
    // noop
  }

  egress(/* service */) {
    // noop
  }

  getMessageHandler(service, callback) {
    // return async (data, type) => {
    //   const data = await service.call({ data, type })
    //   return new Packet(Packet.PACKET_RESPONSE, data)
    // }
    return (data, type) => service.call({ data, type })
    // return async (data, type) => {
    //   const packet = await service.call({ data, type })
    //   if (packet && Packet.isResponse(packet)) {
    //     callback(packet)
    //   }
    // }
  }

  // getTopicName(nodeID, type) {
  //   const { topicPrefix: prefix, topicNameDelimiter: delimiter } = this.options
  //   return [prefix, nodeID, type].filter(Boolean).join(delimiter)
  // }

  // getTypeFromTopic(topic) {
  //   return topic.split(topicNameDelimiter)[2]
  // }

  // onIncomingMessage(service, payload, type) {
  //   return service.call({ payload, type })
  // }

  // subscribeToTopics(subscribe) {
  //   const nodeID = this.broker.nodeID
  //   const topics = [
  //     { nodeID, type: Packet.PACKET_REQUEST },
  //     { nodeID, type: Packet.PACKET_RESPONSE }
  //   ]
  //   const subscriptions = topics.map(topic =>
  //     subscribe(topic.nodeID, topic.type)
  //   )
  //   return Promise.all(subscriptions).then(() => true)
  // }
}
