import Packet from '../packet'

export const Serializers = {
  Base: require('./base').BaseSerializer,
  JSON: require('./json').JSONSerializer
}

export const JSON = opts => plugin(new Serializers.JSON(opts))
// export const ProtoBuf = opts => plugin(new Serializers.ProtoBuf(opts))

// export function ingress(serializer) {
//   return async (ctx, next) => {
//     const { data, type } = ctx.msg
//     const payload = serializer.deserialize(data, type)
//     ctx.packet = Packet.create(type, payload)

//     const result = await next(ctx)

//     if (!result) {
//       return Packet.create() // empty packet
//     }

//     const type = Packet.PACKET_TYPE_RESPONSE
//     const data = serializer.serialize(result, type)
//     const payload = {
//       id: ctx.id,
//       data
//     }
//     return Packet.create(type, payload, ctx.packet.sender)
//   }
// }

// export function egress(serializer) {
//   return async (ctx, next) => {
//     // const { payload } = ctx.packet
//     const payload = {
//       id: ctx.id,
//       data: ctx.msg,
//       sender: ctx.nodeID // ?
//     }
//     const data = serializer.serialize(payload)
//     Packet.create(ctx.cmd, data)
//     const result = await next(ctx)
//     if (result) {
//       const payload = serializer.deserialize(
//         result,
//         Packet.PACKET_TYPE_RESPONSE
//       )
//       return payload.data
//     }
//   }
// }

export function ingress(serializer) {
  return async (ctx, next) => {
    const { data, type } = ctx.msg
    ctx.packet = ctx.deserialize(data, type)
    // ctx.packet = Packet.create(type, payload)

    console.log('ingres deserializer', ctx.packet)

    const result = await next(ctx)

    if (Packet.isRequest(ctx.packet)) {
      const packet = Packet.create(
        Packet.PACKET_TYPE_RESPONSE,
        result,
        ctx.packet.payload.sender
      )
      packet.payload = ctx.serialize(packet)
      return packet
      const res = serializer.serialize(result, Packet.PACKET_TYPE_RESPONSE)
      return Packet.create(Packet.PACKET_TYPE_RESPONSE, res, payload.sender)
    }
  }
}

export function egress(serializer) {
  return (ctx, next) => {
    const payload = {
      id: ctx.id,
      data: ctx.msg,
      sender: ctx.nodeID // ?
    }

    const data = serializer.serialize(payload)
    ctx.packet = Packet.create(ctx.cmd, data)

    // console.log('egress serializer', ctx.packet)

    return next(ctx)
  }
}

function middleware(serializer) {
  const serialize = packet => {
    return serializer.serialize(packet.payload, packet.type)
  }
  const deserialize = (buf, type) => {
    const payload = serializer.deserialize(buf, type)
    return Packet.create(type, payload)
  }

  return (ctx, next) => {
    ctx.serialize = serialize
    ctx.deserialize = deserialize
    return next(ctx)
  }
}

export function plugin(serializer) {
  return connect => {
    connect.use(middleware(serializer))
    connect.ingress.use(ingress(serializer))
    connect.egress.use(egress(serializer))
    // const m = middleware(serializer)
    // connect.ingress.use(m)
    // connect.egress.use(m)
  }
  // return {
  //   ingress: ingress(serializer),
  //   egress: egress(serializer)
  // }
}

export function resolve(serializer) {
  if (serializer instanceof Serializers.Base) {
    return serializer
  }

  let opt = { type: 'JSON' }

  if (typeof serializer === 'string') {
    opt = { type: serializer }
  } else if (typeof serializer === 'object') {
    opt = serializer
  }

  const SerializerClass = Serializers[opt.type]

  if (!SerializerClass) {
    throw new Error(`Invalid serializer type ${opt.type}`)
  }

  return new SerializerClass(opt.options)
}

export default {
  Serializers,
  ingress,
  egress,
  plugin,
  resolve
}
