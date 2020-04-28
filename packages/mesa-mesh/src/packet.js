import { Packet as BasePacket } from '@mesa/transport';

const PACKET_UP = 'UP';
const PACKET_DOWN = 'DOWN';

export default class Packet extends BasePacket {
  static isUp(packet = {}) {
    return PACKET_UP === packet.type;
  }

  static isDown(packet = {}) {
    return PACKET_DOWN === packet.type;
  }
}

Object.assign(Packet, {
  PACKET_UP,
  PACKET_DOWN
});
