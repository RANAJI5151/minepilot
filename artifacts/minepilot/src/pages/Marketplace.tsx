import { useState } from "react";
import { useListPlugins, useInstallPlugin, useListInstalledPlugins } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Check, Loader2, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SERVER_TYPES = [
  { id: "all", label: "All Platforms" },
  { id: "paper", label: "Paper" },
  { id: "spigot", label: "Spigot" },
  { id: "pocketmine", label: "PocketMine" },
  { id: "bungeecord", label: "BungeeCord" },
  { id: "velocity", label: "Velocity" },
];

const CATEGORIES = ["All", "Utility", "Permissions", "Economy", "API", "Building", "Protection", "Logging", "World Management", "Maps", "Performance", "Communication", "Custom Content", "Mobs & Combat", "NPCs", "Display", "Security", "Minigame", "HUD", "Anti-Cheat", "UI"];

const SERVER_TYPE_COLORS: Record<string, string> = {
  paper: "bg-red-500/20 text-red-400 border-red-500/30",
  spigot: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pocketmine: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  bungeecord: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  velocity: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

export default function Marketplace() {
  const { data: plugins, isLoading } = useListPlugins();
  const { data: installed } = useListInstalledPlugins({});
  const installPlugin = useInstallPlugin();

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [installing, setInstalling] = useState<Set<string>>(new Set());

  const installedIds = new Set((installed ?? []).map((p: { pluginId: string }) => p.pluginId));

  const filtered = (plugins ?? []).filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === "all" || (p as { serverType?: string }).serverType === selectedType;
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchType && matchCategory;
  });

  async function handleInstall(pluginId: string) {
    if (installing.has(pluginId)) return;
    setInstalling(prev => new Set([...prev, pluginId]));
    try {
      await installPlugin.mutateAsync({ data: { pluginId } });
      toast.success("Plugin installed successfully!");
    } catch {
      toast.error("Failed to install plugin. Please try again.");
    } finally {
      setInstalling(prev => { const s = new Set(prev); s.delete(pluginId); return s; });
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-card to-background p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">Plugin Marketplace</h1>
          <p className="text-lg text-muted-foreground">Discover and install plugins for Paper, Spigot, PocketMine, BungeeCord, and Velocity.</p>
        </div>
        <div className="w-full md:w-auto relative z-10 flex gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Server Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {SERVER_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              selectedType === type.id
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground mt-2 shrink-0" />
        {CATEGORIES.filter(c => {
          if (c === "All") return true;
          return (plugins ?? []).some(p => p.category === c && (selectedType === "all" || (p as { serverType?: string }).serverType === selectedType));
        }).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedCategory === cat
                ? "bg-secondary text-secondary-foreground border-primary/40"
                : "bg-transparent text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="text-foreground font-medium">{filtered.length}</span> plugins
        {installedIds.size > 0 && <span> · <span className="text-primary font-medium">{installedIds.size}</span> installed</span>}
      </p>

      {/* Plugin Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Card key={i} className="h-64 animate-pulse bg-card" />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedType}-${selectedCategory}-${search}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((plugin, i) => {
              const isInstalled = installedIds.has(plugin.id);
              const isInstallingThis = installing.has(plugin.id);
              const pluginWithType = plugin as typeof plugin & { serverType?: string; rating?: number; downloads?: string };

              return (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Card className={`h-full flex flex-col glow-hover group relative ${isInstalled ? "border-primary/40 bg-primary/5" : ""}`}>
                    {isInstalled && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Installed
                        </span>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center text-primary ring-1 ring-primary/30 group-hover:scale-110 transition-transform shrink-0">
                          <Download className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {pluginWithType.serverType && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SERVER_TYPE_COLORS[pluginWithType.serverType] ?? "bg-secondary text-secondary-foreground border-border"}`}>
                              {pluginWithType.serverType === "pocketmine" ? "PocketMine" :
                               pluginWithType.serverType === "bungeecord" ? "BungeeCord" :
                               pluginWithType.serverType!.charAt(0).toUpperCase() + pluginWithType.serverType!.slice(1)}
                            </span>
                          )}
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {plugin.category}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">{plugin.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">by {plugin.author}</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{plugin.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {plugin.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground border border-border/50">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {pluginWithType.downloads && (
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{pluginWithType.downloads}</span>
                          {pluginWithType.rating && <span>⭐ {pluginWithType.rating}</span>}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/50 flex justify-between items-center bg-card/50 rounded-b-2xl">
                      <div className="text-xs font-mono text-muted-foreground">v{plugin.version}</div>
                      <Button
                        size="sm"
                        variant={isInstalled ? "outline" : "default"}
                        className={isInstalled ? "border-primary/30 text-primary hover:bg-primary/10" : "shadow-lg shadow-primary/20"}
                        disabled={isInstalled || isInstallingThis}
                        onClick={() => handleInstall(plugin.id)}
                      >
                        {isInstallingThis ? (
                          <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Installing...</>
                        ) : isInstalled ? (
                          <><Check className="w-3 h-3 mr-1" /> Installed</>
                        ) : (
                          <><Download className="w-3 h-3 mr-1" /> Install</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground text-lg">No plugins match your filters.</p>
                <button onClick={() => { setSearch(""); setSelectedType("all"); setSelectedCategory("All"); }} className="mt-3 text-primary text-sm hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
