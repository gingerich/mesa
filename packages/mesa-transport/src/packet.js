const PACKET_UNKNOWN = 'UNKNOWN'
const PACKET_RESPONSE = 'RESPONSE'
const PACKET_REQUEST = 'REQUEST'
const PACKET_EVENT = 'EVENT'

export default class Packet {
  static isResponse(packet) {
    return !!packet && PACKET_RESPONSE === packet.type
  }

  static isRequest(packet) {
    return !!packet && PACKET_REQUEST === packet.type
  }

  static isEvent(packet) {
    return !!packet && PACKET_EVENT === packet.type
  }

  static create(type = PACKET_UNKNOWN, payload = {}, target = null) {
    return new Packet(type, payload, target)
  }

  constructor(type, payload, target) {
    this.type = type
    this.payload = payload
    this.target = target
  }
}

Object.assign(Packet, {
  PACKET_UNKNOWN,
  PACKET_REQUEST,
  PACKET_RESPONSE,
  PACKET_EVENT
})
