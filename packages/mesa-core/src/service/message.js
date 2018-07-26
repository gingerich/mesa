export class Message {
  constructor(value) {
    this.value = value
  }
}

Message.parse = function parse(...args) {
  let path = [],
    i = 0
  for (; i < args.length && typeof args[i] === 'string'; i++) {
    path = path.concat(args[i].split('.'))
  }

  const act = path.pop()
  const parts = args.slice(i)
  const payload = Object.assign({}, act && { act }, parts.pop())

  const msg = path.reduceRight(
    (body, ns) => ({ body, ns }),
    parts.reduceRight((body, ns) => ({ ns, body }), payload)
  )

  return new Message(msg)
}

Message.from = function from(...args) {
  if (args[0] instanceof Message) {
    return args[0]
  }
  return Message.parse(...args)
}
