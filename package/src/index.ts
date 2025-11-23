export { MCPGateway } from './gateway-server.js';

// Export types
export interface ServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  env?: Record<string, string>;
}

export interface GatewayConfig {
  servers: ServerConfig[];
}

// Export utility functions
export * from './utils/config.js';