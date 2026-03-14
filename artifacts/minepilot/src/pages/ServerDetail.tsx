import { useState, useRef, useEffect } from "react";
import { 
  useGetServer, useConnectServer, useDisconnectServer, useGetServerStats,
  useGetConsoleHistory, useSendCommand, useListFiles, useReadFile, useWriteFile,
  useListInstalledPlugins
} from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Activity, FolderOpen, Puzzle, Play, Square, RefreshCw, Save, ArrowLeft } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export default function ServerDetail({ id }: { id: number }) {
  const serverId = id;
  const [activeTab, setActiveTab] = useState("overview");

  const { data: server, isLoading, refetch } = useGetServer(serverId);
  
  if (isLoading) return <div className="animate-pulse space-y-4 max-w-5xl mx-auto"><div className="h-32 bg-card rounded-2xl"></div></div>;
  if (!server) return <div>Server not found</div>;

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "console", label: "Console", icon: TerminalIcon },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "plugins", label: "Plugins", icon: Puzzle },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-foreground">{server.name}</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              server.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              'bg-secondary text-muted-foreground border border-border'
            }`}>
              {server.status.toUpperCase()}
            </div>
          </div>
          <p className="text-muted-foreground font-mono">{server.sshUsername}@{server.host}:{server.sshPort}</p>
        </div>
        
        <ServerActions serverId={serverId} status={server.status} onRefresh={refetch} />
      </div>

      <div className="flex space-x-1 border-b border-border/50 pb-px overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5 rounded-t-lg" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-t-lg"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && <OverviewTab serverId={serverId} />}
        {activeTab === "console" && <ConsoleTab serverId={serverId} />}
        {activeTab === "files" && <FilesTab serverId={serverId} />}
        {activeTab === "plugins" && <PluginsTab serverId={serverId} />}
      </motion.div>
    </div>
  );
}

// Subcomponents

function ServerActions({ serverId, status, onRefresh }: { serverId: number, status: string, onRefresh: () => void }) {
  const { toast } = useToast();
  const connect = useConnectServer({ mutation: { onSuccess: () => { onRefresh(); toast({title:"Connected"}); } }});
  const disconnect = useDisconnectServer({ mutation: { onSuccess: () => { onRefresh(); toast({title:"Disconnected"}); } }});

  return (
    <div className="flex items-center gap-3">
      {status !== 'online' ? (
        <Button onClick={() => connect.mutate({ id: serverId })} disabled={connect.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
          <Play className="w-4 h-4 mr-2" /> Connect Node
        </Button>
      ) : (
        <Button variant="destructive" onClick={() => disconnect.mutate({ id: serverId })} disabled={disconnect.isPending}>
          <Square className="w-4 h-4 mr-2" /> Disconnect Node
        </Button>
      )}
    </div>
  );
}

function OverviewTab({ serverId }: { serverId: number }) {
  const { data: stats, isLoading } = useGetServerStats(serverId, { query: { refetchInterval: 10000 } });

  if (isLoading) return <div className="h-64 bg-card animate-pulse rounded-2xl" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-card to-card border-primary/20">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm font-medium">CPU Usage</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">{stats?.cpuUsage || 0}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{width: `${stats?.cpuUsage || 0}%`}} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-card to-card border-blue-500/20">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm font-medium">RAM Usage</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">{formatBytes(stats?.ramUsed || 0, 1)}</span>
            <span className="text-sm text-muted-foreground">/ {formatBytes(stats?.ramTotal || 0, 1)}</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all" style={{width: `${((stats?.ramUsed||0)/(stats?.ramTotal||1))*100}%`}} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-card border-emerald-500/20">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Players Online</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">{stats?.playerCount || 0}</span>
            <span className="text-sm text-muted-foreground">/ {stats?.maxPlayers || 20}</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{width: `${((stats?.playerCount||0)/(stats?.maxPlayers||1))*100}%`}} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-card border-amber-500/20">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Server TPS</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-foreground">{stats?.tps || 20.0}</span>
            <span className="text-sm text-muted-foreground">/ 20.0</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${(stats?.tps||20) < 18 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${((stats?.tps||0)/20)*100}%`}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConsoleTab({ serverId }: { serverId: number }) {
  const [input, setInput] = useState("");
  const { data: history, refetch } = useGetConsoleHistory({ serverId }, { query: { refetchInterval: 3000 } });
  const sendCmd = useSendCommand({ mutation: { onSuccess: () => { setInput(""); refetch(); } }});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCmd.mutate({ data: { serverId, command: input } });
  };

  return (
    <Card className="border-border overflow-hidden flex flex-col h-[600px] shadow-2xl">
      <div className="bg-[#0c0c0e] flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed scroll-smooth">
        {history?.length === 0 ? (
          <div className="text-muted-foreground/50 text-center mt-20">Console is empty. Start the server to see logs.</div>
        ) : (
          history?.map((entry) => (
            <div key={entry.id} className="mb-2">
              <div className="text-blue-400">] {entry.command}</div>
              <div className="text-green-400 whitespace-pre-wrap mt-1">{entry.output}</div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 bg-card border-t border-border flex gap-2 items-center">
        <span className="text-primary font-mono pl-2">{">"}</span>
        <form onSubmit={handleSend} className="flex-1 flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            className="flex-1 font-mono bg-[#0c0c0e] border-border focus-visible:ring-primary/30" 
            placeholder="Enter server command..." 
            autoComplete="off"
            spellCheck="false"
          />
          <Button type="submit" disabled={sendCmd.isPending} className="font-semibold">
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}

function FilesTab({ serverId }: { serverId: number }) {
  const [currentPath, setCurrentPath] = useState("/");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  
  const { data: files, isLoading, refetch } = useListFiles({ serverId, path: currentPath });
  const { data: fileContent, isLoading: loadingContent } = useReadFile({ serverId, path: editingFile || "" }, { query: { enabled: !!editingFile } });
  
  const [content, setContent] = useState("");
  useEffect(() => { if (fileContent) setContent(fileContent.content); }, [fileContent]);

  const { toast } = useToast();
  const writeMutation = useWriteFile({ mutation: { onSuccess: () => { toast({title: "Saved"}); setEditingFile(null); } }});

  if (editingFile) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="py-4 border-b border-border bg-secondary/20 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setEditingFile(null)}><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
            <CardTitle className="text-base font-mono">{editingFile}</CardTitle>
          </div>
          <Button onClick={() => writeMutation.mutate({ data: { serverId, path: editingFile, content } })} disabled={writeMutation.isPending || loadingContent}>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 relative">
          {loadingContent ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50"><RefreshCw className="animate-spin text-primary" /></div>
          ) : (
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-full bg-[#0c0c0e] text-gray-300 font-mono text-sm p-4 focus:outline-none resize-none"
              spellCheck="false"
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[500px]">
      <CardHeader className="py-4 border-b border-border bg-secondary/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 font-mono text-sm">
          <Button variant="ghost" size="sm" onClick={() => {
            const parts = currentPath.split('/').filter(Boolean);
            parts.pop();
            setCurrentPath('/' + parts.join('/'));
          }} disabled={currentPath === '/' || currentPath === ''}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-primary bg-primary/10 px-3 py-1 rounded-md">{currentPath || '/'}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="w-4 h-4 mr-2"/> Refresh</Button>
      </CardHeader>
      <div className="p-0 divide-y divide-border">
        {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : files?.map(f => (
          <div key={f.name} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group cursor-pointer" onClick={() => f.isDirectory ? setCurrentPath((currentPath === '/' ? '' : currentPath) + '/' + f.name) : setEditingFile((currentPath === '/' ? '' : currentPath) + '/' + f.name)}>
            <div className="flex items-center gap-3">
              {f.isDirectory ? <FolderOpen className="w-5 h-5 text-blue-400" /> : <FileText className="w-5 h-5 text-gray-400" />}
              <span className="font-medium group-hover:text-primary transition-colors">{f.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{f.size ? formatBytes(f.size) : '--'}</span>
          </div>
        ))}
        {files?.length === 0 && <div className="p-8 text-center text-muted-foreground">Empty directory</div>}
      </div>
    </Card>
  );
}

function PluginsTab({ serverId }: { serverId: number }) {
  const { data: plugins, isLoading } = useListInstalledPlugins({ serverId });

  if (isLoading) return <div>Loading plugins...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Installed Plugins</h3>
      </div>
      {plugins?.length === 0 ? (
        <Card className="bg-secondary/20 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Puzzle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No plugins installed yet</p>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">Head over to the marketplace to discover and install server plugins.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins?.map(p => (
            <Card key={p.id} className="bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground leading-tight">{p.pluginName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Version {p.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
