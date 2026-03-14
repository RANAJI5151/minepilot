import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateServer } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Terminal } from "lucide-react";
import { Link } from "wouter";

export default function ServerAdd() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createServer = useCreateServer({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Server Added", description: "Successfully connected to server." });
        navigate(`/servers/${data.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Connection Failed", description: err.message || "Check SSH credentials", variant: "destructive" });
      }
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    host: "",
    sshPort: 22,
    sshUsername: "root",
    sshPassword: "",
    serverType: "paper",
    gameMode: "survival"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createServer.mutate({ data: formData });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <Link href="/servers" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Servers
      </Link>
      
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Add New Server</h1>
        <p className="text-muted-foreground">Connect your Linux node via SSH to manage it with MinePilot.</p>
      </div>

      <Card className="border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" /> SSH Connection Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Server Display Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Lobby Node 1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Host / IP Address</label>
                <Input required value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} placeholder="192.168.1.100" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">SSH Username</label>
                <Input required value={formData.sshUsername} onChange={e => setFormData({...formData, sshUsername: e.target.value})} placeholder="root" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SSH Password</label>
                <Input type="password" required value={formData.sshPassword} onChange={e => setFormData({...formData, sshPassword: e.target.value})} placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SSH Port</label>
                <Input type="number" required value={formData.sshPort} onChange={e => setFormData({...formData, sshPort: parseInt(e.target.value)})} />
              </div>
            </div>

            <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Server Type</label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={formData.serverType}
                  onChange={e => setFormData({...formData, serverType: e.target.value})}
                >
                  <option value="paper">Paper (Recommended)</option>
                  <option value="spigot">Spigot</option>
                  <option value="purpur">Purpur</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Game Mode</label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={formData.gameMode}
                  onChange={e => setFormData({...formData, gameMode: e.target.value})}
                >
                  <option value="survival">Survival</option>
                  <option value="skyblock">Skyblock</option>
                  <option value="smp">SMP</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={createServer.isPending}>
                {createServer.isPending ? "Connecting..." : "Connect & Add Server"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
