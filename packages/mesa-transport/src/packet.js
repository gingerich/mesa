export default class Packet {
  static get PACKET_TYPE_RESPONSE() {
    return 'PACKET_TYPE_RESPONSE'
  }

  static get PACKET_TYPE_REQUEST() {
    return 'PACKET_TYPE_REQUEST'
  }

  static get PACKET_TYPE_EVENT() {
    return 'PACKET_TYPE_EVENT'
  }

  static isResponse(packet) {
    return Packet.PACKET_TYPE_RESPONSE === packet.type
  }

  static isRequest(packet) {
    return Packet.PACKET_TYPE_REQUEST === packet.type
  }

  static isEvent(packet) {
    return Packet.PACKET_TYPE_EVENT === packet.type
  }
}
