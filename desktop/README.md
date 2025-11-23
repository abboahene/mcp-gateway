# MCP Gateway Desktop

A modern desktop application for managing your Model Context Protocol (MCP) servers.

MCP Gateway Desktop provides a visual interface to configure, organize, and manage your MCP servers, making it easy to connect them to clients like Claude Desktop and VS Code.

## ✨ Features

- **🏪 Marketplace**: Browse, search, and add servers from the official MCP registry and community sources.
- **🗂️ Group Management**: Organize your servers into logical groups (e.g., "Work", "Personal", "Dev").
- **⚙️ Visual Configuration**: Add, edit, and remove servers without touching JSON files.
- **🔌 Client Config Generation**: Instantly generate the configuration JSON needed for Claude Desktop or VS Code.
- **🌗 Theme Support**: Built-in Light and Dark modes to match your system preference.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine.
- `mcp-gateway` CLI installed (optional, but recommended for backend management).

### Installation

Currently, you can build and run the application from source:

1. Clone the repository.
2. Navigate to the `desktop` directory:
   ```bash
   cd desktop
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

## 📖 Usage

### Adding Servers
1. Go to the **Marketplace** tab.
2. Search for a server or browse by category.
3. Click **Add**, configure the command arguments, and assign it to a group.

### Managing Groups
1. Go to the **Groups** tab.
2. Create new groups to organize your workflow.
3. Move servers between groups or edit their configurations.
4. Deleting a group will remove all servers within it.

### Connecting to Clients
1. In the **Groups** tab, click **Client Config**.
2. Select the groups you want to include (or "All").
3. Copy the generated JSON.
4. Paste it into your client's configuration file (e.g., `claude_desktop_config.json`).

## 🛠️ Development

Built with [Electron](https://www.electronjs.org/), [React](https://react.dev/), [Vite](https://vitejs.dev/), and [shadcn/ui](https://ui.shadcn.com/).

### Commands

- `npm run dev`: Start the app in development mode with hot reloading.
- `npm run build`: Build the application for production.
- `npm run lint`: Run the linter.

## 📄 License

MIT

