import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResultSchema, CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOCK_SERVER_PATH = path.join(__dirname, 'mock-server.ts');
const GATEWAY_SERVER_PATH = path.join(__dirname, '../src/gateway-server.ts');
const CONFIG_PATH = path.join(__dirname, 'test-config.json');

async function runTest() {
  console.log('🧪 Starting Integration Test...');

  // 1. Create Test Config
  const config = {
    servers: [
      {
        id: 'mock',
        name: 'Mock Server',
        command: 'npx',
        args: ['tsx', MOCK_SERVER_PATH],
        enabled: true,
        env: {}
      }
    ]
  };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log('📝 Created test config');

  // 2. Start Gateway Client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', GATEWAY_SERVER_PATH],
    env: {
      ...process.env,
      MCP_GATEWAY_CONFIG: CONFIG_PATH
    }
  });

  try {
    console.log('🔌 Connecting to gateway...');
    await client.connect(transport);
    console.log('✅ Connected to gateway');

    // 3. List Tools
    console.log('🔍 Listing tools...');
    const toolsResult = await client.request(
      { method: 'tools/list' },
      ListToolsResultSchema
    );
    
    const echoTool = toolsResult.tools.find(t => t.name === 'mock_echo');
    if (!echoTool) {
      throw new Error('Expected tool "mock_echo" not found!');
    }
    console.log('✅ Found "mock_echo" tool');

    // 4. Call Tool
    console.log('📞 Calling tool...');
    const callResult = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'mock_echo',
          arguments: { message: 'Hello World' }
        }
      },
      CallToolResultSchema
    );

    const content = callResult.content[0];
    if (content.type !== 'text' || content.text !== 'Echo: Hello World') {
      throw new Error(`Unexpected result: ${JSON.stringify(callResult)}`);
    }
    console.log('✅ Tool call successful: "Echo: Hello World"');

    console.log('🎉 Test Passed!');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    await fs.unlink(CONFIG_PATH).catch(() => {});
  }
}

runTest();
