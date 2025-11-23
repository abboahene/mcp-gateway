import { Separator } from "@/components/ui/separator"

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Introduction</h1>
        <p className="text-lg text-muted-foreground">
          Aggregate multiple MCP servers into a single endpoint.
        </p>
      </div>
      <Separator />
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p>
          MCP Gateway allows you to use multiple Model Context Protocol (MCP) servers with just one configuration entry in Claude Desktop, VS Code, or any MCP client.
        </p>
        <h3>Problem It Solves</h3>
        <p>
          Without MCP Gateway, you have to configure each server individually in your client's configuration file. This can become unmanageable as you add more servers.
        </p>
        <p>
          With MCP Gateway, you configure your servers once in the gateway, and then add the gateway to your client.
        </p>
        <h3>Features</h3>
        <ul>
          <li><strong>Single Configuration</strong>: One entry in your MCP client config.</li>
          <li><strong>Hot Reload</strong>: Add/remove servers without restarting clients.</li>
          <li><strong>CLI Interface</strong>: Easy server management from terminal.</li>
          <li><strong>Secure</strong>: Credentials stored in config file.</li>
        </ul>
      </div>
    </div>
  )
}
