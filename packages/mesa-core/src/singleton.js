import { Broker } from './service/broker'

export const broker = new Broker()

export const call = broker.call.bind(broker)

export const partial = broker.partial.bind(broker)

export const createService = broker.createService.bind(broker)
