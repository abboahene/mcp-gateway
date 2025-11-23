import { useEffect, useState } from 'react';
import { fetchMarketplaceServers } from '../lib/github';
import type { MarketServer } from '../lib/github';
import { loadConfig, saveConfig } from '../lib/config';
import type { GatewayConfig } from '../lib/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ExternalLink, Plus, Search } from 'lucide-react';

export default function Marketplace() {
  const [servers, setServers] = useState<MarketServer[]>([]);
  const [config, setConfig] = useState<GatewayConfig>({ servers: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<MarketServer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('default');

  useEffect(() => {
    async function init() {
      try {
        const [marketServers, localConfig] = await Promise.all([
          fetchMarketplaceServers(),
          loadConfig()
        ]);
        setServers(marketServers);
        setConfig(localConfig);
      } catch (error) {
        console.error('Failed to initialize marketplace', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleAddClick = (server: MarketServer) => {
    setSelectedServer(server);
    setCommand(''); // Reset or try to infer?
    setArgs('');
    setSelectedGroup('default');
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedServer) return;

    const newServer = {
      id: crypto.randomUUID(),
      name: selectedServer.name,
      command: command,
      args: args.split(' ').filter(Boolean),
      enabled: true,
      group: selectedGroup === 'default' ? undefined : selectedGroup,
      env: {}
    };

    const newConfig = {
      ...config,
      servers: [...config.servers, newServer]
    };

    try {
      await saveConfig(newConfig);
      setConfig(newConfig);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save server', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading marketplace...</div>;
  }

  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedServers = filteredServers.reduce((acc, server) => {
    const category = server.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(server);
    return acc;
  }, {} as Record<string, MarketServer[]>);

  const categoryOrder = [
    'Official Integrations',
    'Reference Servers',
    'Archived',
    'Community Servers',
    'Resources',
    'For servers'
  ];

  const categories = Object.keys(groupedServers).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  const ServerCard = ({ server }: { server: MarketServer }) => (
    <Card className="flex flex-col overflow-hidden">
      <div className="h-24 w-full bg-muted flex items-center justify-center overflow-hidden relative">
        {server.image ? (
          <img src={server.image} alt={server.name} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="text-3xl text-muted-foreground/20 font-bold select-none">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-base flex items-center gap-2 truncate" title={server.name}>
          {server.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 h-8 text-xs mt-1">
          {server.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0 pb-2 min-h-[20px]">
        {server.url && (
          <a 
            href={server.url} 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1"
          >
            View Source <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button size="sm" className="w-full h-8 text-xs" onClick={() => handleAddClick(server)}>
          <Plus className="mr-2 h-3 w-3" /> Add
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground">Discover and add MCP servers to your gateway.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search servers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-8 mt-6">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {groupedServers[category].map((server, i) => (
                  <ServerCard key={i} server={server} />
                ))}
              </div>
            </div>
          ))}
          {filteredServers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No servers found matching "{searchQuery}"
            </div>
          )}
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groupedServers[category].map((server, i) => (
                <ServerCard key={i} server={server} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {selectedServer?.name}</DialogTitle>
            <DialogDescription>
              Configure the command to run this server.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="command">Command</Label>
              <Input 
                id="command" 
                placeholder="e.g. npx -y @modelcontextprotocol/server-filesystem" 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="args">Arguments</Label>
              <Input 
                id="args" 
                placeholder="e.g. /path/to/allowed/dir" 
                value={args}
                onChange={(e) => setArgs(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="group">Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">No Group (Default)</SelectItem>
                  {config.groups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!command}>Add Server</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
