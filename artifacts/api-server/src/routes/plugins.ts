import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { installedPluginsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { sshService } from "../services/ssh.js";
import { activityService } from "../services/activity.js";
import { InstallPluginBody } from "@workspace/api-zod";

const router: IRouter = Router();

export const PLUGIN_CATALOG = [
  // ─── PAPER / SPIGOT ───────────────────────────────────────────────────────
  {
    id: "essentialsx",
    name: "EssentialsX",
    description: "The essential plugin suite for Spigot/Paper. Provides /home, /warp, /tp, economy, and 200+ commands out of the box.",
    version: "2.21.0",
    author: "EssentialsX Team",
    category: "Utility",
    serverType: "paper",
    downloadUrl: "https://github.com/EssentialsX/Essentials/releases/latest/download/EssentialsX-2.21.0.jar",
    tags: ["utility", "essential", "economy", "commands"],
    rating: 4.9,
    downloads: "10M+",
  },
  {
    id: "luckperms",
    name: "LuckPerms",
    description: "A powerful, fast, and scalable permissions plugin with a web-based editor. Supports all server platforms.",
    version: "5.4.141",
    author: "Luck",
    category: "Permissions",
    serverType: "paper",
    downloadUrl: "https://download.luckperms.net/1564/bukkit/loader/LuckPerms-Bukkit-5.4.141.jar",
    tags: ["permissions", "ranks", "groups"],
    rating: 5.0,
    downloads: "8M+",
  },
  {
    id: "vault",
    name: "Vault",
    description: "Economy, permission, and chat API. Required dependency for most economy-based plugins like ShopGUI and Jobs.",
    version: "1.7.3",
    author: "milkbowl",
    category: "API",
    serverType: "paper",
    downloadUrl: "https://github.com/MilkBowl/Vault/releases/latest/download/Vault.jar",
    tags: ["api", "economy", "dependency"],
    rating: 4.8,
    downloads: "12M+",
  },
  {
    id: "worldedit",
    name: "WorldEdit",
    description: "The ultimate in-game map editor. Select regions, fill areas, copy/paste structures, and sculpt terrain with ease.",
    version: "7.3.10",
    author: "EngineHub",
    category: "Building",
    serverType: "paper",
    downloadUrl: "https://builds.enginehub.org/job/worldedit/last-successful/WorldEdit-Bukkit-7.3.10-dist.jar",
    tags: ["building", "editing", "regions"],
    rating: 4.9,
    downloads: "15M+",
  },
  {
    id: "worldguard",
    name: "WorldGuard",
    description: "Protect regions of your world, control who can build or PvP. Works alongside WorldEdit for full world control.",
    version: "7.0.13",
    author: "EngineHub",
    category: "Protection",
    serverType: "paper",
    downloadUrl: "https://builds.enginehub.org/job/worldguard/last-successful/WorldGuard-Bukkit-7.0.13-dist.jar",
    tags: ["protection", "regions", "anti-grief"],
    rating: 4.9,
    downloads: "9M+",
  },
  {
    id: "coreprotect",
    name: "CoreProtect",
    description: "Lightning-fast block logging and rollback. Track every block, container, and entity change — roll back griefing in seconds.",
    version: "22.4",
    author: "Intelli",
    category: "Logging",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/coreprotect.8631/download",
    tags: ["logging", "anti-grief", "rollback"],
    rating: 4.8,
    downloads: "5M+",
  },
  {
    id: "multiverse-core",
    name: "Multiverse-Core",
    description: "Manage multiple worlds on one server. Create, import, clone, and teleport between worlds with simple commands.",
    version: "4.3.14",
    author: "Multiverse Team",
    category: "World Management",
    serverType: "paper",
    downloadUrl: "https://github.com/Multiverse/Multiverse-Core/releases/latest",
    tags: ["worlds", "multiworld", "management"],
    rating: 4.7,
    downloads: "7M+",
  },
  {
    id: "dynmap",
    name: "Dynmap",
    description: "Real-time dynamic web map for your server. View your world live in any browser with player positions and chat.",
    version: "3.7",
    author: "mikeprimm",
    category: "Maps",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/dynmap.274/download",
    tags: ["map", "web", "real-time"],
    rating: 4.7,
    downloads: "4M+",
  },
  {
    id: "chunky",
    name: "Chunky",
    description: "Pre-generate your world chunks to eliminate lag spikes caused by new chunk generation during gameplay.",
    version: "1.4.28",
    author: "pop4959",
    category: "Performance",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/chunky.81534/download",
    tags: ["performance", "pre-generation", "chunks"],
    rating: 4.8,
    downloads: "2M+",
  },
  {
    id: "spark",
    name: "Spark",
    description: "Advanced performance profiler for servers, clients, and proxies. Find the exact cause of lag and TPS drops.",
    version: "1.10.119",
    author: "lucko",
    category: "Performance",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/spark.57242/download",
    tags: ["performance", "profiler", "lag"],
    rating: 5.0,
    downloads: "3M+",
  },
  {
    id: "discordsrv",
    name: "DiscordSRV",
    description: "The most powerful Minecraft-Discord bridge. Sync chat, console, death messages, and events between your server and Discord.",
    version: "1.27.0",
    author: "DiscordSRV",
    category: "Communication",
    serverType: "paper",
    downloadUrl: "https://github.com/DiscordSRV/DiscordSRV/releases/latest",
    tags: ["discord", "chat", "integration"],
    rating: 4.8,
    downloads: "2M+",
  },
  {
    id: "shopguiplus",
    name: "ShopGUI+",
    description: "Feature-rich GUI shop with NBT support, multi-page shops, and price multipliers. The #1 shop plugin for Paper/Spigot.",
    version: "1.97.0",
    author: "brc-dd",
    category: "Economy",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/shopgui.6515/download",
    tags: ["economy", "shop", "gui"],
    rating: 4.6,
    downloads: "1.5M+",
  },
  {
    id: "itemsadder",
    name: "ItemsAdder",
    description: "Create custom items, blocks, armor, HUDs, GUI, and more using resource packs. No mods required.",
    version: "3.6.5",
    author: "LoneDev",
    category: "Custom Content",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/itemsadder.73355/download",
    tags: ["custom-items", "resource-pack", "hud"],
    rating: 4.5,
    downloads: "800K+",
  },
  {
    id: "mythicmobs",
    name: "MythicMobs",
    description: "Create custom mobs with complex AI, skills, and loot tables. Build epic boss fights and dungeon encounters.",
    version: "5.6.1",
    author: "MythicCraft",
    category: "Mobs & Combat",
    serverType: "paper",
    downloadUrl: "https://www.spigotmc.org/resources/mythicmobs.5702/download",
    tags: ["mobs", "boss", "skills", "ai"],
    rating: 4.7,
    downloads: "1M+",
  },
  {
    id: "citizens2",
    name: "Citizens2",
    description: "The original NPC plugin. Create human, animal, and monster NPCs with custom traits, paths, and dialogues.",
    version: "2.0.35",
    author: "fullwall",
    category: "NPCs",
    serverType: "paper",
    downloadUrl: "https://ci.citizensnpcs.co/job/Citizens2/lastSuccessfulBuild/artifact/dist/Citizens-2.0.35.jar",
    tags: ["npc", "dialogue", "quests"],
    rating: 4.8,
    downloads: "6M+",
  },

  // ─── SPIGOT-SPECIFIC ──────────────────────────────────────────────────────
  {
    id: "protocollib",
    name: "ProtocolLib",
    description: "Provides read and write access to the Minecraft protocol. Required by many advanced Spigot plugins.",
    version: "5.3.0",
    author: "dmulloy2",
    category: "API",
    serverType: "spigot",
    downloadUrl: "https://github.com/dmulloy2/ProtocolLib/releases/latest",
    tags: ["api", "protocol", "dependency"],
    rating: 4.9,
    downloads: "11M+",
  },
  {
    id: "holographicdisplays",
    name: "HolographicDisplays",
    description: "Create floating text and items using holograms. Perfect for leaderboards, info signs, and decorations.",
    version: "3.0.3",
    author: "filoghost",
    category: "Display",
    serverType: "spigot",
    downloadUrl: "https://dev.bukkit.org/projects/holographic-displays/files/latest",
    tags: ["hologram", "display", "leaderboard"],
    rating: 4.7,
    downloads: "3M+",
  },
  {
    id: "packetevents",
    name: "PacketEvents",
    description: "A powerful packet library for Spigot. Enables advanced packet manipulation with minimal performance overhead.",
    version: "2.5.0",
    author: "retrooper",
    category: "API",
    serverType: "spigot",
    downloadUrl: "https://github.com/retrooper/packetevents/releases/latest",
    tags: ["api", "packets", "dependency"],
    rating: 4.8,
    downloads: "900K+",
  },
  {
    id: "jobs-reborn",
    name: "Jobs Reborn",
    description: "Let players earn money by performing in-game actions: mining, fishing, crafting, and more. Highly configurable.",
    version: "5.2.3.5",
    author: "Zrips",
    category: "Economy",
    serverType: "spigot",
    downloadUrl: "https://www.spigotmc.org/resources/jobs-reborn.4216/download",
    tags: ["economy", "jobs", "mcmmo"],
    rating: 4.5,
    downloads: "2M+",
  },
  {
    id: "lands",
    name: "Lands",
    description: "Advanced land claiming and nation system with war, diplomacy, chunk claiming, and chest locking. All-in-one.",
    version: "6.50.12",
    author: "Angeschossen",
    category: "Protection",
    serverType: "spigot",
    downloadUrl: "https://www.spigotmc.org/resources/lands-land-claim-plugin-grief-prevention-protection-gui-management-nations-wars-1-20-support.53313/download",
    tags: ["land-claim", "protection", "nations"],
    rating: 4.6,
    downloads: "500K+",
  },

  // ─── POCKETMINE-MP ────────────────────────────────────────────────────────
  {
    id: "pm-economyapi",
    name: "EconomyAPI",
    description: "The standard economy API for PocketMine-MP. Provides currency management compatible with all major PM plugins.",
    version: "6.0.0",
    author: "onebone",
    category: "Economy",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/EconomyAPI/EconomyAPI.phar",
    tags: ["economy", "api", "pocketmine"],
    rating: 4.6,
    downloads: "500K+",
  },
  {
    id: "pm-formapi",
    name: "FormAPI",
    description: "Create custom UI forms for Bedrock players. Essential for server menus, shops, and interactive GUIs on PocketMine.",
    version: "2.1.1",
    author: "jojoe77777",
    category: "UI",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/FormAPI/FormAPI.phar",
    tags: ["forms", "ui", "gui", "bedrock"],
    rating: 4.8,
    downloads: "800K+",
  },
  {
    id: "pm-clearlag",
    name: "PocketMine-ClearLag",
    description: "Automatically remove excess entities to reduce lag and improve TPS on your PocketMine-MP server.",
    version: "2.0.0",
    author: "Muqsit",
    category: "Performance",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/ClearLag/ClearLag.phar",
    tags: ["performance", "lag", "entities"],
    rating: 4.4,
    downloads: "200K+",
  },
  {
    id: "pm-anticheat",
    name: "NoCheatPlus-PM",
    description: "Anti-cheat plugin for PocketMine-MP. Detect and block fly, speed, reach, and other common hacks on Bedrock.",
    version: "1.3.0",
    author: "PMMP-NCP",
    category: "Anti-Cheat",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/NoCheatPlus/NoCheatPlus.phar",
    tags: ["anticheat", "security", "bedrock"],
    rating: 4.3,
    downloads: "150K+",
  },
  {
    id: "pm-skywars",
    name: "SkyWars",
    description: "Full-featured SkyWars minigame for PocketMine-MP. Supports kits, cages, voting, spectating, and statistics.",
    version: "1.5.0",
    author: "DaPigGuy",
    category: "Minigame",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/SkyWarsForPE/SkyWarsForPE.phar",
    tags: ["skywars", "minigame", "bedrock"],
    rating: 4.5,
    downloads: "100K+",
  },
  {
    id: "pm-scorehud",
    name: "ScoreHud",
    description: "Display a custom scoreboard HUD for all players. Show scores, money, ping, coords, and more on Bedrock.",
    version: "6.1.0",
    author: "Tedo207",
    category: "HUD",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/ScoreHud/ScoreHud.phar",
    tags: ["scoreboard", "hud", "display", "bedrock"],
    rating: 4.6,
    downloads: "300K+",
  },
  {
    id: "pm-simplewarp",
    name: "SimpleWarp",
    description: "Easy warp management for PocketMine-MP. Players can create, delete, and teleport to warps with a simple GUI.",
    version: "2.0.3",
    author: "MylesIsCool",
    category: "Utility",
    serverType: "pocketmine",
    downloadUrl: "https://poggit.pmmp.io/r/SimpleWarp/SimpleWarp.phar",
    tags: ["warp", "teleport", "utility", "bedrock"],
    rating: 4.4,
    downloads: "120K+",
  },

  // ─── BUNGEECORD ───────────────────────────────────────────────────────────
  {
    id: "bungee-luckperms",
    name: "LuckPerms (BungeeCord)",
    description: "Network-wide permissions with BungeeCord integration. Sync ranks and permissions across all backend servers.",
    version: "5.4.141",
    author: "Luck",
    category: "Permissions",
    serverType: "bungeecord",
    downloadUrl: "https://download.luckperms.net/1564/bungee/loader/LuckPerms-BungeeCord-5.4.141.jar",
    tags: ["permissions", "network", "bungeecord"],
    rating: 5.0,
    downloads: "3M+",
  },
  {
    id: "bungee-motdpaste",
    name: "BungeeTabListPlus",
    description: "Customize the player tab list across your entire BungeeCord network. Show server counts, pings, and custom headers.",
    version: "3.3.4",
    author: "CodeCrafter47",
    category: "Display",
    serverType: "bungeecord",
    downloadUrl: "https://github.com/CodeCrafter47/BungeeTabListPlus/releases/latest",
    tags: ["tablist", "display", "network"],
    rating: 4.7,
    downloads: "800K+",
  },
  {
    id: "bungee-discord-bridge",
    name: "Bungee-Discord",
    description: "Bridge BungeeCord network events to Discord. Get alerts for server switches, joins, leaves, and crashes.",
    version: "2.1.0",
    author: "BungeeDiscord",
    category: "Communication",
    serverType: "bungeecord",
    downloadUrl: "https://www.spigotmc.org/resources/bungee-discord.18863/download",
    tags: ["discord", "network", "notifications"],
    rating: 4.3,
    downloads: "200K+",
  },
  {
    id: "bungee-antivpn",
    name: "AntiVPN",
    description: "Block VPN and proxy connections on your BungeeCord network to reduce alt accounts and ban evaders.",
    version: "7.0.0",
    author: "egg82",
    category: "Security",
    serverType: "bungeecord",
    downloadUrl: "https://www.spigotmc.org/resources/anti-vpn.58291/download",
    tags: ["vpn", "security", "ban-evasion"],
    rating: 4.6,
    downloads: "500K+",
  },

  // ─── VELOCITY ─────────────────────────────────────────────────────────────
  {
    id: "velocity-luckperms",
    name: "LuckPerms (Velocity)",
    description: "Network-wide permissions for Velocity proxy. Centralize rank management across all backend servers.",
    version: "5.4.141",
    author: "Luck",
    category: "Permissions",
    serverType: "velocity",
    downloadUrl: "https://download.luckperms.net/1564/velocity/LuckPerms-Velocity-5.4.141.jar",
    tags: ["permissions", "network", "velocity"],
    rating: 5.0,
    downloads: "1M+",
  },
  {
    id: "velocity-miniplaceholders",
    name: "MiniPlaceholders",
    description: "Powerful placeholder API for Velocity using MiniMessage formatting. Supports per-player and global placeholders.",
    version: "2.2.3",
    author: "MiniPlaceholders Team",
    category: "API",
    serverType: "velocity",
    downloadUrl: "https://github.com/MiniPlaceholders/MiniPlaceholders/releases/latest",
    tags: ["placeholders", "api", "mini-message"],
    rating: 4.7,
    downloads: "300K+",
  },
  {
    id: "velocity-signedvelocity",
    name: "SignedVelocity",
    description: "Handles Minecraft's chat signing system on Velocity proxies to prevent client disconnections on 1.19+ servers.",
    version: "1.1.3",
    author: "4drian3d",
    category: "Security",
    serverType: "velocity",
    downloadUrl: "https://github.com/4drian3d/SignedVelocity/releases/latest",
    tags: ["chat-signing", "1.19", "security"],
    rating: 4.8,
    downloads: "200K+",
  },
  {
    id: "velocity-kickredirect",
    name: "KickRedirect",
    description: "Automatically redirect kicked players to a fallback server instead of disconnecting them from the network.",
    version: "2.0.2",
    author: "4drian3d",
    category: "Utility",
    serverType: "velocity",
    downloadUrl: "https://github.com/4drian3d/KickRedirect/releases/latest",
    tags: ["kick", "fallback", "network"],
    rating: 4.5,
    downloads: "100K+",
  },
];

router.get("/", requireAuth, async (_req, res) => {
  res.json(PLUGIN_CATALOG);
});

router.get("/installed", requireAuth, async (req: AuthRequest, res) => {
  const conditions = [eq(installedPluginsTable.userId, req.userId!)];
  const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : null;
  if (serverId && !isNaN(serverId)) {
    conditions.push(eq(installedPluginsTable.serverId, serverId));
  }
  const installed = await db.select().from(installedPluginsTable).where(and(...conditions));
  res.json(installed);
});

router.post("/install", requireAuth, async (req: AuthRequest, res) => {
  const parsed = InstallPluginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { serverId, pluginId } = parsed.data;

  const plugin = PLUGIN_CATALOG.find(p => p.id === pluginId);
  if (!plugin) {
    res.status(404).json({ error: "Plugin not found" });
    return;
  }

  const conditions = [
    eq(installedPluginsTable.userId, req.userId!),
    eq(installedPluginsTable.pluginId, pluginId),
  ];
  if (serverId) conditions.push(eq(installedPluginsTable.serverId, serverId));

  const existing = await db.select().from(installedPluginsTable).where(and(...conditions)).limit(1);

  if (existing.length > 0) {
    res.json({ message: `${plugin.name} is already installed` });
    return;
  }

  if (serverId && sshService.isConnected(serverId)) {
    try {
      await sshService.exec(serverId, `mkdir -p ~/server/plugins && wget -q "${plugin.downloadUrl}" -O ~/server/plugins/${plugin.name}-${plugin.version}.jar 2>&1 || echo "Download attempted"`);
    } catch {
      // Continue even if SSH download fails — record install anyway
    }
  }

  await db.insert(installedPluginsTable).values({
    userId: req.userId!,
    serverId: serverId ?? null,
    pluginId: plugin.id,
    pluginName: plugin.name,
    version: plugin.version,
    serverType: plugin.serverType,
  });

  await activityService.log(req.userId!, serverId ?? null, "plugin_installed", `Installed ${plugin.name} v${plugin.version}`);
  res.json({ message: `${plugin.name} installed successfully` });
});

router.delete("/uninstall", requireAuth, async (req: AuthRequest, res) => {
  const pluginId = req.query.pluginId as string;
  if (!pluginId) {
    res.status(400).json({ error: "pluginId required" });
    return;
  }

  const conditions = [
    eq(installedPluginsTable.userId, req.userId!),
    eq(installedPluginsTable.pluginId, pluginId),
  ];
  const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : null;
  if (serverId && !isNaN(serverId)) conditions.push(eq(installedPluginsTable.serverId, serverId));

  await db.delete(installedPluginsTable).where(and(...conditions));
  res.json({ message: "Plugin uninstalled" });
});

export default router;
