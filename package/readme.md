# MCP Gateway

> **Aggregate multiple MCP servers into a single endpoint**

MCP Gateway allows you to use multiple Model Context Protocol servers with just one configuration entry in Claude Desktop, VS Code, or any MCP client.

## 🎯 Problem It Solves

**Before MCP Gateway:**
```json
{
  "mcpServers": {
    "github": { "command": "npx", "args": ["@modelcontextprotocol/server-github"] },
    "slack": { "command": "npx", "args": ["@slack/mcp-server"] },
    "postgres": { "command": "npx", "args": ["@modelcontextprotocol/server-postgres"] },
    "filesystem": { "command": "npx", "args": ["@modelcontextprotocol/server-filesystem"] }
    // ... and more, each requiring separate configuration
  }
}
```

**With MCP Gateway:**
```json
{
  "mcpServers": {
    "gateway": { "command": "mcp-gateway", "args": ["start"] }
  }
}
```

Just **ONE** config entry for **ALL** your MCP servers! 🎉

## ✨ Features

- 🚀 **Single Configuration** - One entry in your MCP client config
- 🔌 **Hot Reload** - Add/remove servers without restarting clients
- 🎨 **CLI Interface** - Easy server management from terminal
- 🔒 **Secure** - Credentials stored in config file
- 📦 **Zero Dependencies** (for clients) - Just install and use
- 🛠️ **Tool Prefixing** - Avoids naming conflicts between servers
- ⚡ **Fast** - Parallel execution of tool calls

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @mcp-gateway/cli
```

### Local Installation

```bash
npm install @mcp-gateway/cli
```

## 🚀 Quick Start

### 1. Initialize

```bash
mcp-gateway init
```

### 2. Add Servers

```bash
# Add GitHub server
mcp-gateway add \
  --id github \
  --name "GitHub" \
  --command npx \
  --args @modelcontextprotocol/server-github \
  --env GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token

# Add Slack server
mcp-gateway add \
  --id slack \
  --name "Slack" \
  --command npx \
  --args @slack/mcp-server \
  --env SLACK_BOT_TOKEN=xoxb-your-token

# Add PostgreSQL server
mcp-gateway add \
  --id postgres \
  --name "PostgreSQL" \
  --command npx \
  --args @modelcontextprotocol/server-postgres \
  --env POSTGRES_CONNECTION_STRING=postgresql://localhost:5432/mydb
```

### 3. List Servers

```bash
mcp-gateway list
```

Output:
```
📦 Configured Servers:

GitHub ✓ enabled
  ID: github
  Command: npx @modelcontextprotocol/server-github

Slack ✓ enabled
  ID: slack
  Command: npx @slack/mcp-server

PostgreSQL ✓ enabled
  ID: postgres
  Command: npx @modelcontextprotocol/server-postgres
```

### 4. Generate Client Config

```bash
mcp-gateway config
```

Output:
```json
{
  "mcpServers": {
    "mcp-gateway": {
      "command": "mcp-gateway",
      "args": ["start"]
    }
  }
}
```

### 5. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-gateway": {
      "command": "mcp-gateway",
      "args": ["start"]
    }
  }
}
```

### 6. Restart Claude Desktop

That's it! All your servers are now available in Claude! 🎉

## 📚 CLI Commands

### `mcp-gateway init`
Initialize MCP Gateway with interactive setup

### `mcp-gateway start`
Start the gateway server (used by clients)

### `mcp-gateway list`
List all configured servers

### `mcp-gateway add`
Add a new server

**Options:**
- `-i, --id <id>` - Server ID (required)
- `-n, --name <name>` - Server name (required)
- `-c, --command <command>` - Command to run (required)
- `-a, --args <args...>` - Command arguments
- `-e, --env <vars...>` - Environment variables (KEY=VALUE)
- `--disabled` - Add but keep disabled

**Example:**
```bash
mcp-gateway add \
  --id github \
  --name "GitHub" \
  --command npx \
  --args @modelcontextprotocol/server-github \
  --env GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx
```

### `mcp-gateway remove <id>`
Remove a server

**Example:**
```bash
mcp-gateway remove github
```

### `mcp-gateway enable <id>`
Enable a disabled server

**Example:**
```bash
mcp-gateway enable github
```

### `mcp-gateway disable <id>`
Disable a server (without removing it)

**Example:**
```bash
mcp-gateway disable github
```

### `mcp-gateway config`
Generate client configuration

**Options:**
- `-o, --output <type>` - Output format: `claude` or `vscode` (default: `claude`)

**Example:**
```bash
mcp-gateway config --output claude
mcp-gateway config --output vscode
```

## 🔧 Configuration

Configuration is stored at `~/.mcp-gateway/config.json`:

```json
{
  "servers": [
    {
      "id": "github",
      "name": "GitHub",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "enabled": true,
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    },
    {
      "id": "slack",
      "name": "Slack",
      "command": "npx",
      "args": ["@slack/mcp-server"],
      "enabled": true,
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-xxx",
        "SLACK_TEAM_ID": "T1234"
      }
    }
  ]
}
```

## 🎭 How It Works

### Tool Prefixing

To avoid naming conflicts, MCP Gateway prefixes all tool names with the server ID:

```
Original tool: "create_issue"
Gateway tool: "github_create_issue"

Original tool: "send_message"  
Gateway tool: "slack_send_message"
```

### Request Flow

```
Claude Desktop
    ↓
MCP Gateway (single connection)
    ↓
Routes to appropriate server
    ↓
┌──────────┬──────────┬──────────┐
│  GitHub  │  Slack   │ Postgres │
└──────────┴──────────┴──────────┘
```

### Example

**User asks:** "Create a GitHub issue and notify the team on Slack"

**Behind the scenes:**
1. Claude calls `github_create_issue` tool
2. Gateway routes to GitHub server
3. Issue created
4. Claude calls `slack_send_message` tool
5. Gateway routes to Slack server
6. Message sent

All through **ONE** gateway connection!

## 🔐 Security

- Credentials stored in config file at `~/.mcp-gateway/config.json`
- File permissions should be `600` (read/write for owner only)
- Future: Keychain integration for encrypted storage

**Secure your config:**
```bash
chmod 600 ~/.mcp-gateway/config.json
```

## 📖 Popular Server Examples

### GitHub
```bash
mcp-gateway add \
  --id github \
  --name "GitHub" \
  --command npx \
  --args @modelcontextprotocol/server-github \
  --env GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token
```

### Slack
```bash
mcp-gateway add \
  --id slack \
  --name "Slack" \
  --command npx \
  --args @slack/mcp-server \
  --env SLACK_BOT_TOKEN=xoxb_your_token \
  --env SLACK_TEAM_ID=T1234567
```

### PostgreSQL
```bash
mcp-gateway add \
  --id postgres \
  --name "PostgreSQL" \
  --command npx \
  --args @modelcontextprotocol/server-postgres \
  --env POSTGRES_CONNECTION_STRING=postgresql://localhost:5432/mydb
```

### Filesystem
```bash
mcp-gateway add \
  --id filesystem \
  --name "Filesystem" \
  --command npx \
  --args @modelcontextprotocol/server-filesystem /path/to/directory
```

### Google Drive
```bash
mcp-gateway add \
  --id gdrive \
  --name "Google Drive" \
  --command npx \
  --args @modelcontextprotocol/server-gdrive \
  --env GOOGLE_API_KEY=your_api_key
```

## 🐛 Troubleshooting

### Gateway won't start
```bash
# Check Node.js version (need 18+)
node --version

# Check if config is valid
cat ~/.mcp-gateway/config.json | jq .

# Try starting manually
mcp-gateway start
```

### Server not connecting
```bash
# Test server directly
npx @modelcontextprotocol/server-github

# Check credentials
cat ~/.mcp-gateway/config.json

# Enable a disabled server
mcp-gateway enable github
```

### Tools not showing in Claude
1. Restart Claude Desktop
2. Check gateway is running
3. Verify config path is correct

### Check logs
```bash
# Gateway logs to stderr
mcp-gateway start 2> gateway.log
```

## 🚀 Programmatic Usage

You can also use MCP Gateway as a library:

```typescript
import { MCPGateway } from '@mcp-gateway/cli';

const gateway = new MCPGateway();
await gateway.start();
```

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/mcp-gateway.git
cd mcp-gateway

# Install dependencies
npm install

# Build
npm run build

# Run in dev mode
npm run dev

# Test CLI
npm run cli -- list
```

## 📝 License

MIT

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## 🙏 Acknowledgments

Built with the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic.

---

**Made with ❤️ by the community**
