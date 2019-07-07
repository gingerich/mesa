import { BaseSerializer } from './base'

export class JSONSerializer extends BaseSerializer {
  serialize(obj) {
    return Buffer.from(JSON.stringify(obj))
  }

  deserialize(buffer) {
    return JSON.parse(buffer)
  }
}
