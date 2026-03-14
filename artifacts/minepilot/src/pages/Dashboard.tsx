import { useListServers, useListActivity } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Server, Activity, Users, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: servers, isLoading: loadingServers } = useListServers();
  const { data: activity, isLoading: loadingActivity } = useListActivity({ limit: 10 });

  const onlineServers = servers?.filter(s => s.status === 'online').length || 0;
  const totalServers = servers?.length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your Minecraft infrastructure</p>
        </div>
        <Link href="/servers/new" className="inline-block">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Server
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-card glow-hover border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Servers</p>
              <p className="text-3xl font-display font-bold mt-1">{loadingServers ? "..." : totalServers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card glow-hover border-emerald-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Online Servers</p>
              <p className="text-3xl font-display font-bold mt-1">{loadingServers ? "..." : onlineServers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card glow-hover border-blue-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Players</p>
              <p className="text-3xl font-display font-bold mt-1">--</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Servers</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingServers ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-secondary/50 rounded-xl" />)}
              </div>
            ) : servers?.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground">No servers added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servers?.slice(0, 5).map(server => (
                  <Link key={server.id} href={`/servers/${server.id}`} className="block">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${server.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-destructive'}`} />
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{server.name}</p>
                          <p className="text-xs text-muted-foreground">{server.host}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">
                          {server.serverType || "Vanilla"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
               <div className="animate-pulse space-y-4">
                 {[1,2,3,4].map(i => <div key={i} className="h-12 bg-secondary/50 rounded-xl" />)}
               </div>
            ) : activity?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border">
                {activity?.map(act => (
                  <div key={act.id} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-[23px] h-[23px] bg-card border-2 border-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{act.action}</p>
                    {act.details && <p className="text-xs text-muted-foreground mt-0.5">{act.details}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
