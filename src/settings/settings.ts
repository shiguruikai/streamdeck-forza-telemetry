import net from 'node:net';

export type GlobalSettings = {
  port?: number;
  address?: string;
};

export function parseSettings(jsonSettings: object): GlobalSettings {
  const result: GlobalSettings = {};

  if ('port' in jsonSettings && typeof jsonSettings['port'] === 'string') {
    const port = Number.parseInt(jsonSettings['port'], 10);
    if (Number.isInteger(port) && port > 0 && port < 65536) {
      result.port = port;
    }
  }

  if (
    'address' in jsonSettings &&
    typeof jsonSettings['address'] === 'string' &&
    net.isIPv4(jsonSettings['address'])
  ) {
    result.address = jsonSettings['address'];
  }

  return result;
}
