import { Separator } from "@/components/ui/separator"

export default function DesktopDocsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Desktop App</h1>
        <p className="text-lg text-muted-foreground">
          A beautiful desktop interface for managing your MCP Gateway.
        </p>
      </div>
      <Separator />
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Overview</h2>
        <p>
          The MCP Gateway Desktop app provides a user-friendly interface to manage your MCP servers,
          configure settings, and explore the marketplace of available MCP servers.
        </p>

        <h2>Features</h2>
        <ul>
          <li>🖥️ <strong>Visual Management</strong> - Manage servers with a beautiful UI</li>
          <li>🏪 <strong>Marketplace</strong> - Discover and install new MCP servers</li>
          <li>⚙️ <strong>Easy Configuration</strong> - Configure environment variables and arguments visually</li>
          <li>🌗 <strong>Dark Mode</strong> - Built-in dark mode support</li>
          <li>🔄 <strong>Real-time Updates</strong> - Changes are immediately reflected</li>
        </ul>

        <h2>Getting Started</h2>
        <h3>Installation</h3>
        <p>Download the latest release for your operating system from the releases page.</p>

        <h3>Usage</h3>
        <ol>
          <li>Launch the application</li>
          <li>Navigate to the <strong>Marketplace</strong> tab to find servers</li>
          <li>Click &quot;Install&quot; on any server you wish to add</li>
          <li>Configure the server settings (API keys, etc.)</li>
          <li>Go to the <strong>My Servers</strong> tab to manage your installed servers</li>
        </ol>

        <h2>Development</h2>
        <h3>Prerequisites</h3>
        <ul>
          <li>Node.js 18+</li>
          <li>npm or yarn</li>
        </ul>

        <h3>Running Locally</h3>
        <pre><code>{`# Install dependencies
npm install

# Start development server
npm run dev`}</code></pre>

        <h3>Building</h3>
        <pre><code>{`# Build for production
npm run build

# Build for your platform
npm run dist`}</code></pre>
      </div>
    </div>
  )
}
