import os from 'os'

export function getNodeID(service) {
  return `${service.name}::${os.hostname()}-${process.pid}`
}
