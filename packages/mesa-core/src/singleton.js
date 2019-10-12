import { ServiceBroker } from './service/broker'

export const broker = new ServiceBroker()

export const call = broker.call.bind(broker)

export const createService = broker.createService.bind(broker)
