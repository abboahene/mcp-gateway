import { useEffect, useState } from 'react';
import { loadConfig, saveConfig } from '../lib/config';
import type { GatewayConfig, ServerConfig, GroupConfig } from '../lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Trash2, Plus, Settings, FileJson } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ConfigDialog } from '../components/config-dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Groups() {
  const [config, setConfig] = useState<GatewayConfig>({ servers: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // Config Dialog State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configGroups, setConfigGroups] = useState<string[]>([]);

  // Edit Server State
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null);
  const [editCommand, setEditCommand] = useState('');
  const [editArgs, setEditArgs] = useState('');
  const [editGroup, setEditGroup] = useState<string>('default');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await loadConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    
    // Create a slug from the name for readable IDs
    const slug = newGroupName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug) {
      alert('Invalid group name');
      return;
    }

    // Check for duplicates in both config groups and implicit groups
    const configGroupIds = new Set(config.groups.map(g => g.id));
    const implicitGroups = new Set(
      config.servers
        .map(s => s.group)
        .filter((g): g is string => !!g && !configGroupIds.has(g))
    );

    if (configGroupIds.has(slug) || implicitGroups.has(slug)) {
      alert('A group with this ID already exists.');
      return;
    }
    
    const newGroup: GroupConfig = {
      id: slug,
      name: newGroupName
    };

    const newConfig = {
      ...config,
      groups: [...config.groups, newGroup]
    };

    await saveAndRefresh(newConfig);
    setIsCreateGroupOpen(false);
    setNewGroupName('');
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure? Servers in this group will be ungrouped.')) return;

    // Remove group and update servers that were in this group
    const newConfig = {
      ...config,
      groups: config.groups.filter(g => g.id !== groupId),
      servers: config.servers.map(s => 
        s.group === groupId ? { ...s, group: undefined } : s
      )
    };

    await saveAndRefresh(newConfig);
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to remove this server?')) return;

    const newConfig = {
      ...config,
      servers: config.servers.filter(s => s.id !== serverId)
    };

    await saveAndRefresh(newConfig);
  };

  const handleEditClick = (server: ServerConfig) => {
    setEditingServer(server);
    setEditCommand(server.command);
    setEditArgs(server.args.join(' '));
    setEditGroup(server.group || 'default');
  };

  const handleSaveEdit = async () => {
    if (!editingServer) return;

    const updatedServer = {
      ...editingServer,
      command: editCommand,
      args: editArgs.split(' ').filter(Boolean),
      group: editGroup === 'default' ? undefined : editGroup
    };

    const newConfig = {
      ...config,
      servers: config.servers.map(s => s.id === editingServer.id ? updatedServer : s)
    };

    await saveAndRefresh(newConfig);
    setEditingServer(null);
  };

  const handleGenerateConfig = (groups: string[]) => {
    setConfigGroups(groups);
    setIsConfigOpen(true);
  };

  const saveAndRefresh = async (newConfig: GatewayConfig) => {
    try {
      await saveConfig(newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save config', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const ungroupedServers = config.servers.filter(s => !s.group);

  // Find groups that are used in servers but not defined in config
  const configGroupIds = new Set(config.groups.map(g => g.id));
  const implicitGroups = Array.from(new Set(
    config.servers
      .map(s => s.group)
      .filter((g): g is string => !!g && !configGroupIds.has(g))
  )).map(id => ({ id, name: id }));

  const allGroups = [...config.groups, ...implicitGroups];
  const defaultTab = ungroupedServers.length > 0 ? 'ungrouped' : (allGroups.length > 0 ? allGroups[0].id : undefined);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Groups</h2>
          <p className="text-sm text-muted-foreground">Manage your server groups and configurations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleGenerateConfig([...(ungroupedServers.length ? ['default'] : []), ...allGroups.map(g => g.id)])}>
            <FileJson className="mr-2 h-4 w-4" /> Client Config
          </Button>
          <Button onClick={() => setIsCreateGroupOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create Group
          </Button>
        </div>
      </div>

      {(!ungroupedServers.length && !allGroups.length) ? (
        <div className="text-center py-12 text-muted-foreground">
          No servers or groups configured.
        </div>
      ) : (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1">
            {ungroupedServers.length > 0 && (
              <TabsTrigger value="ungrouped">Ungrouped</TabsTrigger>
            )}
            {allGroups.map(group => (
              <TabsTrigger key={group.id} value={group.id}>{group.name}</TabsTrigger>
            ))}
          </TabsList>

          {ungroupedServers.length > 0 && (
            <TabsContent value="ungrouped" className="mt-4">
              <Card>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg font-bold">Ungrouped Servers</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleGenerateConfig(['default'])}>
                    <FileJson className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid gap-2 mt-2">
                    {ungroupedServers.map(server => (
                      <ServerCard 
                        key={server.id} 
                        server={server} 
                        onDelete={() => handleDeleteServer(server.id)} 
                        onEdit={() => handleEditClick(server)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {allGroups.map(group => {
            const groupServers = config.servers.filter(s => s.group === group.id);
            return (
              <TabsContent key={group.id} value={group.id} className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                    <CardTitle className="text-lg font-bold">{group.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleGenerateConfig([group.id])}>
                        <FileJson className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteGroup(group.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2 mt-2">
                      {groupServers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No servers in this group</p>
                      ) : (
                        groupServers.map(server => (
                          <ServerCard 
                            key={server.id} 
                            server={server} 
                            onDelete={() => handleDeleteServer(server.id)} 
                            onEdit={() => handleEditClick(server)}
                          />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <ConfigDialog 
        open={isConfigOpen} 
        onOpenChange={setIsConfigOpen} 
        groups={configGroups} 
      />

      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Organize your servers into logical groups.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                placeholder="e.g. Work, Personal, Dev"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup} disabled={!newGroupName}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingServer} onOpenChange={(open) => !open && setEditingServer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingServer?.name}</DialogTitle>
            <DialogDescription>
              Update server configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-command">Command</Label>
              <Input 
                id="edit-command" 
                value={editCommand}
                onChange={(e) => setEditCommand(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-args">Arguments</Label>
              <Input 
                id="edit-args" 
                value={editArgs}
                onChange={(e) => setEditArgs(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-group">Group</Label>
              <Select value={editGroup} onValueChange={setEditGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">No Group (Default)</SelectItem>
                  {allGroups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingServer(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServerCard({ server, onDelete, onEdit }: { server: ServerConfig, onDelete: () => void, onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <div className="grid gap-0.5">
        <div className="font-medium text-sm flex items-center gap-2">
          {server.name}
          <Badge variant={server.enabled ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
            {server.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground font-mono truncate max-w-[500px]">
          {server.command} {server.args.join(' ')}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Settings className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
