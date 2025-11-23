import { Separator } from "@/components/ui/separator"

export default function CliDocsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">CLI / Server</h1>
        <p className="text-lg text-muted-foreground">
          Aggregate multiple MCP servers into a single endpoint.
        </p>
      </div>
      <Separator />
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Problem It Solves</h2>
        <p><strong>Before MCP Gateway:</strong></p>
        <pre><code>{`{
  "mcpServers": {
    "github": { "command": "npx", "args": ["@modelcontextprotocol/server-github"] },
    "slack": { "command": "npx", "args": ["@slack/mcp-server"] },
    "postgres": { "command": "npx", "args": ["@modelcontextprotocol/server-postgres"] },
    "filesystem": { "command": "npx", "args": ["@modelcontextprotocol/server-filesystem"] }
    // ... and more, each requiring separate configuration
  }
}`}</code></pre>

        <p><strong>With MCP Gateway:</strong></p>
        <pre><code>{`{
  "mcpServers": {
    "gateway": { "command": "mcp-gateway", "args": ["start"] }
  }
}`}</code></pre>
        <p>Just <strong>ONE</strong> config entry for <strong>ALL</strong> your MCP servers! 🎉</p>

        <h2>Features</h2>
        <ul>
          <li>🚀 <strong>Single Configuration</strong> - One entry in your MCP client config</li>
          <li>🔌 <strong>Hot Reload</strong> - Add/remove servers without restarting clients</li>
          <li>🎨 <strong>CLI Interface</strong> - Easy server management from terminal</li>
          <li>🔒 <strong>Secure</strong> - Credentials stored in config file</li>
          <li>📦 <strong>Zero Dependencies</strong> (for clients) - Just install and use</li>
          <li>🛠️ <strong>Tool Prefixing</strong> - Avoids naming conflicts between servers</li>
          <li>⚡ <strong>Fast</strong> - Parallel execution of tool calls</li>
        </ul>

        <h2>Installation</h2>
        <h3>Global Installation (Recommended)</h3>
        <pre><code>npm install -g @mcp-gateway/cli</code></pre>

        <h3>Local Installation</h3>
        <pre><code>npm install @mcp-gateway/cli</code></pre>

        <h2>Quick Start</h2>
        <h3>1. Initialize</h3>
        <pre><code>mcp-gateway init</code></pre>

        <h3>2. Add Servers</h3>
        <pre><code>{`# Add GitHub server
mcp-gateway add \\
  --id github \\
  --name "GitHub" \\
  --command npx \\
  --args @modelcontextprotocol/server-github \\
  --env GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token

# Add Slack server
mcp-gateway add \\
  --id slack \\
  --name "Slack" \\
  --command npx \\
  --args @slack/mcp-server \\
  --env SLACK_BOT_TOKEN=xoxb-your-token`}</code></pre>

        <h3>3. List Servers</h3>
        <pre><code>mcp-gateway list</code></pre>

        <h3>4. Generate Client Config</h3>
        <pre><code>mcp-gateway config</code></pre>

        <h2>CLI Commands</h2>
        <ul>
          <li><code>mcp-gateway init</code>: Initialize MCP Gateway with interactive setup</li>
          <li><code>mcp-gateway start</code>: Start the gateway server (used by clients)</li>
          <li><code>mcp-gateway list</code>: List all configured servers</li>
          <li><code>mcp-gateway add</code>: Add a new server</li>
          <li><code>mcp-gateway remove &lt;id&gt;</code>: Remove a server</li>
          <li><code>mcp-gateway enable &lt;id&gt;</code>: Enable a disabled server</li>
          <li><code>mcp-gateway disable &lt;id&gt;</code>: Disable a server</li>
          <li><code>mcp-gateway config</code>: Generate client configuration</li>
        </ul>

        <h2>Configuration</h2>
        <p>Configuration is stored at <code>~/.mcp-gateway/config.json</code>.</p>

        <h2>How It Works</h2>
        <h3>Tool Prefixing</h3>
        <p>To avoid naming conflicts, MCP Gateway prefixes all tool names with the server ID:</p>
        <pre><code>{`Original tool: "create_issue"
Gateway tool: "github_create_issue"

Original tool: "send_message"  
Gateway tool: "slack_send_message"`}</code></pre>

        <h2>Programmatic Usage</h2>
        <pre><code>{`import { MCPGateway } from '@mcp-gateway/cli';

const gateway = new MCPGateway();
await gateway.start();`}</code></pre>
      </div>
    </div>
  )
}
