import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

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

export const CONFIG_DIR = path.join(os.homedir(), '.mcp-gateway');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    // Ignore if already exists
  }
}

export async function loadConfig(): Promise<GatewayConfig> {
  const configPath = process.env.MCP_GATEWAY_CONFIG || CONFIG_PATH;
  try {
    if (configPath === CONFIG_PATH) {
      await ensureConfigDir();
    }
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { servers: [] };
  }
}

export async function saveConfig(config: GatewayConfig): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function addServer(server: ServerConfig): Promise<void> {
  const config = await loadConfig();
  
  // Check if server already exists
  const existingIndex = config.servers.findIndex(s => s.id === server.id);
  
  if (existingIndex >= 0) {
    config.servers[existingIndex] = server;
  } else {
    config.servers.push(server);
  }
  
  await saveConfig(config);
}

export async function removeServer(serverId: string): Promise<boolean> {
  const config = await loadConfig();
  const initialLength = config.servers.length;
  
  config.servers = config.servers.filter(s => s.id !== serverId);
  
  if (config.servers.length !== initialLength) {
    await saveConfig(config);
    return true;
  }
  
  return false;
}

export async function enableServer(serverId: string): Promise<boolean> {
  const config = await loadConfig();
  const server = config.servers.find(s => s.id === serverId);
  
  if (server) {
    server.enabled = true;
    await saveConfig(config);
    return true;
  }
  
  return false;
}

export async function disableServer(serverId: string): Promise<boolean> {
  const config = await loadConfig();
  const server = config.servers.find(s => s.id === serverId);
  
  if (server) {
    server.enabled = false;
    await saveConfig(config);
    return true;
  }
  
  return false;
}

export async function getServer(serverId: string): Promise<ServerConfig | undefined> {
  const config = await loadConfig();
  return config.servers.find(s => s.id === serverId);
}

export async function listServers(onlyEnabled = false): Promise<ServerConfig[]> {
  const config = await loadConfig();
  
  if (onlyEnabled) {
    return config.servers.filter(s => s.enabled);
  }
  
  return config.servers;
}