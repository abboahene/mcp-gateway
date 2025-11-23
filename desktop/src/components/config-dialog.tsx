import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Check, Copy } from 'lucide-react';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: string[];
}

export function ConfigDialog({ open, onOpenChange, groups }: ConfigDialogProps) {
  const [copied, setCopied] = useState(false);

  const serverName = "mcp-gateway";
  const env = { MCP_GATEWAY_GROUPS: groups.join(',') };

  const config = {
    mcpServers: {
      [serverName]: {
        command: "mcp-gateway",
        args: ["start"],
        env
      }
    }
  };

  const jsonString = JSON.stringify(config, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Client Configuration</DialogTitle>
          <DialogDescription>
            Add this configuration to your MCP client (Claude Desktop, VS Code, etc.)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="claude" className="w-full">
          <TabsList>
            <TabsTrigger value="claude">Claude Desktop</TabsTrigger>
            <TabsTrigger value="vscode">VS Code</TabsTrigger>
          </TabsList>
          
          <div className="relative mt-4">
            <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm font-mono">
              {jsonString}
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <TabsContent value="claude" className="mt-2">
            <p className="text-sm text-muted-foreground">
              Paste into: <code className="bg-muted px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code>
            </p>
          </TabsContent>
          
          <TabsContent value="vscode" className="mt-2">
            <p className="text-sm text-muted-foreground">
              Paste into VS Code Settings (JSON) under <code className="bg-muted px-1 rounded">"mcpServers"</code> (merge with existing)
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
