export class Message {
  static from(...args) {
    if (args[0] instanceof Message) {
      return args[0]
    }
    return Message.parse(...args)
  }

  static parse(...args) {
    let path = [],
      i = 0
    for (; i < args.length && typeof args[i] === 'string'; i++) {
      path = path.concat(args[i].split('.'))
      // path.push(...args[i].split('.'))
    }

    const act = path.pop()
    const parts = args.slice(i)
    const msgBody = Object.assign({}, act && { act }, parts.pop())

    const payload = path.reduceRight(
      (body, ns) => ({ body, ns }),
      parts.reduceRight((body, ns) => ({ ns, body }), msgBody)
    )

    return new Message(payload)
  }

  constructor(payload) {
    this.payload = payload
  }
}
