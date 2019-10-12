import { getNodeID } from '../utils'
import { IngressHandler } from './ingress'
import { EgressHandler } from './egress'

export class Transit {
  constructor(transporter, service) {
    this.transporter = transporter
    this.service = service
    this.nodeId = getNodeID(service)
    this.pendingRequests = new Map()
    this.ingressHandler = new IngressHandler(this)
    this.egressHandler = new EgressHandler(this)
  }

  ingress() {
    return this.ingressHandler.handler()
  }

  egress() {
    return this.egressHandler.handler()
  }
}

Transit.prototype.PROTOCOL_VERSION = Transit.PROTOCOL_VERSION = '1'
