export const Serializers = {
  Base: require('./base').BaseSerializer,
  JSON: require('./json').JSONSerializer
}

export const JSON = opts => middleware(new Serializers.JSON(opts))
// export const ProtoBuf = opts => middleware(new Serializers.ProtoBuf(opts))

export function ingress(serializer) {
  return async (ctx, next) => {
    ctx.msg = serializer.deserialize(ctx.msg.data)
    const data = await next(ctx)
    return serializer.serialize(data)
  }
}

export function egress(serializer) {
  return async (ctx, next) => {
    ctx.payload = serializer.serialize(ctx.msg)
    const data = await next(ctx)
    return serializer.deserialize(data)
  }
}

export function middleware(serializer) {
  return {
    ingress: ingress(serializer),
    egress: egress(serializer)
  }
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
  middleware,
  resolve
}
