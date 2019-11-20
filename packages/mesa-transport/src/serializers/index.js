import Packet from '../packet';

export const Serializers = {
  Base: require('./base').BaseSerializer,
  JSON: require('./json').JSONSerializer
};

export const JSON = opts => plugin(new Serializers.JSON(opts));
// export const ProtoBuf = opts => plugin(new Serializers.ProtoBuf(opts))

export function ingress(serializer) {
  return async (ctx, next) => {
    const { data, type } = ctx.msg;
    ctx.packet = ctx.deserialize(data, type);

    const packet = await next(ctx);

    if (packet) {
      packet.payload = ctx.serialize(packet);
      return packet;
    }
  };
}

export function egress(serializer) {
  return (ctx, next) => {
    ctx.packet.payload = ctx.serialize(ctx.packet);
    return next(ctx);
  };
}

function middleware(serializer) {
  const serialize = packet => {
    return serializer.serialize(packet.payload, packet.type);
  };
  const deserialize = (buf, type) => {
    const payload = serializer.deserialize(buf, type);
    return Packet.create(type, payload);
  };

  return (ctx, next) => {
    ctx.serialize = serialize;
    ctx.deserialize = deserialize;
    return next(ctx);
  };
}

export function plugin(serializer) {
  return connect => {
    connect.use(middleware(serializer));
    connect.ingress.use(ingress(serializer));
    connect.egress.use(egress(serializer));
    // const m = middleware(serializer)
    // connect.ingress.use(m)
    // connect.egress.use(m)
  };
  // return {
  //   ingress: ingress(serializer),
  //   egress: egress(serializer)
  // }
}

export function resolve(serializer) {
  if (serializer instanceof Serializers.Base) {
    return serializer;
  }

  let opt = { type: 'JSON' };

  if (typeof serializer === 'string') {
    opt = { type: serializer };
  } else if (typeof serializer === 'object') {
    opt = serializer;
  }

  const SerializerClass = Serializers[opt.type];

  if (!SerializerClass) {
    throw new Error(`Invalid serializer type ${opt.type}`);
  }

  return new SerializerClass(opt.options);
}

export default {
  Serializers,
  ingress,
  egress,
  plugin,
  resolve
};
