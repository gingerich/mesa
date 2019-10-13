import mqtt from 'mqtt'
import MqttTransporter from './transporter'

export function transport(opts = {}) {
  return (connection, transit) => {
    const transporter = new MqttTransporter(transit)
    const client = mqtt.connect(connection)
    transporter.init(client)
    return transporter
  }
}
