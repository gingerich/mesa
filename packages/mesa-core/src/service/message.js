export class Message {
  static isUnhandled(msg) {
    return msg === Message.UNHANDLED
  }

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
    const payload = Object.assign({}, act && { act }, parts.pop())

    const reducer = (body, ns) => ({ ns, body })
    // const payload = path.reduceRight(
    //   reducer,
    //   parts.reduceRight(reducer, payload)
    // )
    const body = [...path, ...parts].reduceRight(reducer, payload)

    return new Message(body)
  }

  constructor(body) {
    this.body = body
  }
}

Message.NULL = Symbol(null)
Message.UNHANDLED = Symbol('Unhandled')

// class Response {
//   static from(message = Message.NULL) {
//     return new Response(message)
//   }

//   static isUnhandled(response) {
//     return response.message === Message.NULL
//   }

//   constructor(message) {
//     this.message = message
//   }
// }
