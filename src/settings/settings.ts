import net from 'node:net';

export type GlobalSettings = {
  port?: number;
  address?: string;
  font?: string;
};

export function parseSettings(jsonSettings: object): GlobalSettings {
  const result: GlobalSettings = {};

  if ('port' in jsonSettings) {
    const portValue = jsonSettings['port'];
    const port = typeof portValue === 'number' ? portValue : Number.parseInt(String(portValue), 10);
    if (Number.isInteger(port) && port > 0 && port < 65536) {
      result.port = port;
    }
  }

  if ('address' in jsonSettings) {
    const address = jsonSettings['address'];
    if (typeof address === 'string' && net.isIPv4(address)) {
      result.address = address;
    }
  }

  if ('font' in jsonSettings) {
    const font = jsonSettings['font'];
    if (typeof font === 'string') {
      result.font = font;
    }
  }

  return result;
}
