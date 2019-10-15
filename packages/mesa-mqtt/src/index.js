import mqtt from 'mqtt'
import MqttTransporter from './transporter'

export function transport(opts = {}) {
  return (connection, transit) => {
    const transporter = new MqttTransporter(transit, opts)
    const settings = { ...connection, host: connection.hostname }
    const client = mqtt.connect(settings)
    transporter.init(client, connection)
    return transporter
  }
}
