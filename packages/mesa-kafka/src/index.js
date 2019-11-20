import { Kafka } from 'kafkajs';
import KafkaTransport from './transport';

export { logLevel } from 'kafkajs';

export function transport(opts) {
  return (connection, transit) => {
    const transporter = new KafkaTransport(transit, opts);
    const settings = {
      clientId: transit.nodeId,
      ...connection
    };
    const kafka = new Kafka(settings);
    transporter.init(kafka, settings);
    return transporter;
  };
}
