import { useListServers } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Server, Plus, Terminal, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Servers() {
  const { data: servers, isLoading } = useListServers();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Servers</h1>
          <p className="text-muted-foreground">Manage your connected Minecraft nodes</p>
        </div>
        <Link href="/servers/new" className="inline-block">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Server
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse bg-card border-border h-48" />
          ))}
        </div>
      ) : servers?.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Server className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">No servers found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Connect your first Minecraft server via SSH to start managing plugins, console, and files.</p>
          <Link href="/servers/new" className="inline-block">
            <Button size="lg">Add Your First Server</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers?.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/servers/${server.id}`}>
                <Card className="h-full glow-hover cursor-pointer group flex flex-col overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      server.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      server.status === 'error' ? 'bg-destructive/20 text-red-400 border border-destructive/30' :
                      'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
                      {server.status.toUpperCase()}
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Server className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{server.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6 mt-1 font-mono">{server.sshUsername}@{server.host}</p>
                    
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <p className="font-semibold text-sm">{server.serverType || 'Vanilla'}</p>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Mode</p>
                        <p className="font-semibold text-sm capitalize">{server.gameMode || 'Survival'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
