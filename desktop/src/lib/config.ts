import { fs, path, os } from './electron';

export interface ServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  env?: Record<string, string>;
  group?: string;
}

export interface GroupConfig {
  id: string;
  name: string;
}

export interface GatewayConfig {
  servers: ServerConfig[];
  groups: GroupConfig[];
}

const CONFIG_DIR = path.join(os.homedir(), '.mcp-gateway');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export async function loadConfig(): Promise<GatewayConfig> {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return { servers: [], groups: [] };
    }
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);
    return {
      servers: config.servers || [],
      groups: config.groups || []
    };
  } catch (error) {
    console.error('Failed to load config', error);
    return { servers: [], groups: [] };
  }
}

export async function saveConfig(config: GatewayConfig): Promise<void> {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save config', error);
    throw error;
  }
}
