import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListToolsResultSchema, CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, ServerConfig } from './utils/config.js';

export class MCPGateway {
  private server: Server;
  private backends: Map<string, Client> = new Map();
  private configPath: string | undefined;

  constructor(configPath?: string) {
    this.configPath = configPath;
    
    this.server = new Server(
      {
        name: 'mcp-gateway',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Handle tool list requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools: any[] = [];

      const toolPromises = Array.from(this.backends.entries()).map(async ([prefix, client]) => {
        try {
          const response = await client.request(
            { method: 'tools/list' },
            ListToolsResultSchema
          );

          // Prefix each tool name with server ID to avoid conflicts
          return response.tools.map((tool) => ({
            ...tool,
            name: `${prefix}_${tool.name}`,
            description: `[${prefix}] ${tool.description || ''}`,
          }));
        } catch (error) {
          console.error(`Error listing tools from ${prefix}:`, error);
          return [];
        }
      });

      const results = await Promise.all(toolPromises);
      for (const tools of results) {
        allTools.push(...tools);
      }

      return { tools: allTools };
    });

    // Handle tool call requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Parse the tool name to extract server prefix
      const separatorIndex = name.indexOf('_');
      if (separatorIndex === -1) {
        throw new Error(`Invalid tool name format: ${name}`);
      }

      const prefix = name.substring(0, separatorIndex);
      const originalName = name.substring(separatorIndex + 1);

      const client = this.backends.get(prefix);
      if (!client) {
        throw new Error(`Unknown server: ${prefix}`);
      }

      try {
        // Forward the request to the appropriate backend
        const response = await client.request(
          {
            method: 'tools/call',
            params: {
              name: originalName,
              arguments: args,
            },
          },
          CallToolResultSchema
        );

        return response;
      } catch (error) {
        console.error(`Error calling tool ${name}:`, error);
        throw error;
      }
    });
  }

  private async connectBackend(serverConfig: ServerConfig): Promise<void> {
    console.error(`Connecting to ${serverConfig.id}...`);

    try {
      const client = new Client(
        {
          name: `gateway-${serverConfig.id}`,
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      const env = Object.fromEntries(
        Object.entries({ ...process.env, ...serverConfig.env }).filter(
          ([_, v]) => v !== undefined
        )
      ) as Record<string, string>;

      const transport = new StdioClientTransport({
        command: serverConfig.command,
        args: serverConfig.args,
        env,
      });

      await client.connect(transport);

      this.backends.set(serverConfig.id, client);
      console.error(`✓ Connected to ${serverConfig.id}`);

      // Notify clients that tools have changed
      await this.notifyToolsChanged();
    } catch (error) {
      console.error(`Failed to connect to ${serverConfig.id}:`, error);
      throw error;
    }
  }

  private async notifyToolsChanged(): Promise<void> {
    try {
      await this.server.notification({
        method: 'notifications/tools/list_changed',
        params: {},
      });
    } catch (error) {
      // Notifications are best-effort
      console.error('Error sending notification:', error);
    }
  }

  async start(): Promise<void> {
    const config = await loadConfig();
    
    // Determine allowed groups
    // Priority: MCP_GATEWAY_GROUPS (list) > MCP_GATEWAY_GROUP (single) > 'default'
    let allowedGroups: string[] = ['default'];
    
    if (process.env.MCP_GATEWAY_GROUPS) {
      allowedGroups = process.env.MCP_GATEWAY_GROUPS.split(',').map(g => g.trim());
    } else if (process.env.MCP_GATEWAY_GROUP) {
      allowedGroups = [process.env.MCP_GATEWAY_GROUP];
    }

    console.error(`Starting MCP Gateway for groups: ${allowedGroups.join(', ')}`);

    // Connect to all enabled servers in the target groups
    for (const serverConfig of config.servers) {
      const serverGroup = serverConfig.group || 'default';
      
      if (serverConfig.enabled && allowedGroups.includes(serverGroup)) {
        try {
          await this.connectBackend(serverConfig);
        } catch (error) {
          console.error(`Failed to connect to ${serverConfig.id}:`, error);
        }
      }
    }

    // Start the gateway server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('MCP Gateway started');
  }

  async stop(): Promise<void> {
    // Close all backend connections
    for (const [id, client] of this.backends) {
      try {
        await client.close();
        console.error(`Disconnected from ${id}`);
      } catch (error) {
        console.error(`Error disconnecting from ${id}:`, error);
      }
    }
    
    this.backends.clear();
  }
}

// Start the gateway if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const gateway = new MCPGateway();
  
  gateway.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('\nShutting down...');
    await gateway.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('\nShutting down...');
    await gateway.stop();
    process.exit(0);
  });
}