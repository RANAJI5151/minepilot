import { NodeSSH } from "node-ssh";

interface SSHConnection {
  ssh: NodeSSH;
  host: string;
  username: string;
}

interface ConnectOptions {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ServerStats {
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  ramUsed: number;
  ramTotal: number;
  cpuUsage: number;
  tps: number;
  diskUsed: number;
  diskTotal: number;
}

class SSHService {
  private connections = new Map<number, SSHConnection>();

  async connect(serverId: number, opts: ConnectOptions): Promise<void> {
    if (this.connections.has(serverId)) {
      this.disconnect(serverId);
    }

    const ssh = new NodeSSH();
    await ssh.connect({
      host: opts.host,
      port: opts.port,
      username: opts.username,
      password: opts.password,
      readyTimeout: 10000,
    });

    this.connections.set(serverId, { ssh, host: opts.host, username: opts.username });
  }

  disconnect(serverId: number): void {
    const conn = this.connections.get(serverId);
    if (conn) {
      try { conn.ssh.dispose(); } catch { /* ignore */ }
      this.connections.delete(serverId);
    }
  }

  isConnected(serverId: number): boolean {
    return this.connections.has(serverId);
  }

  async exec(serverId: number, command: string): Promise<string> {
    const conn = this.connections.get(serverId);
    if (!conn) throw new Error("Not connected to server");

    const result = await conn.ssh.execCommand(command);
    return result.stdout || result.stderr || "";
  }

  async getStats(serverId: number): Promise<ServerStats> {
    const conn = this.connections.get(serverId);
    if (!conn) {
      return { online: false, playerCount: 0, maxPlayers: 0, ramUsed: 0, ramTotal: 0, cpuUsage: 0, tps: 20, diskUsed: 0, diskTotal: 0 };
    }

    try {
      const [memResult, cpuResult, diskResult] = await Promise.all([
        conn.ssh.execCommand("free -m | awk 'NR==2{print $3\" \"$2}'"),
        conn.ssh.execCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | sed 's/%us,//'"),
        conn.ssh.execCommand("df -BG / | awk 'NR==2{print $3\" \"$2}'"),
      ]);

      const [ramUsed, ramTotal] = memResult.stdout.split(" ").map(Number);
      const cpuUsage = parseFloat(cpuResult.stdout) || 0;
      const [diskUsed, diskTotal] = diskResult.stdout.replace(/G/g, "").split(" ").map(Number);

      return {
        online: true,
        playerCount: 0,
        maxPlayers: 20,
        ramUsed: isNaN(ramUsed) ? 0 : ramUsed / 1024,
        ramTotal: isNaN(ramTotal) ? 0 : ramTotal / 1024,
        cpuUsage: isNaN(cpuUsage) ? 0 : cpuUsage,
        tps: 20,
        diskUsed: isNaN(diskUsed) ? 0 : diskUsed,
        diskTotal: isNaN(diskTotal) ? 0 : diskTotal,
      };
    } catch {
      return { online: true, playerCount: 0, maxPlayers: 20, ramUsed: 0, ramTotal: 0, cpuUsage: 0, tps: 20, diskUsed: 0, diskTotal: 0 };
    }
  }

  async listFiles(serverId: number, path: string): Promise<{ name: string; path: string; isDirectory: boolean; size: number | null; modifiedAt: string | null }[]> {
    const conn = this.connections.get(serverId);
    if (!conn) throw new Error("Not connected to server");

    const result = await conn.ssh.execCommand(`ls -la --time-style=+"%Y-%m-%d %H:%M:%S" "${path}" 2>&1`);
    const lines = result.stdout.split("\n").filter(l => l && !l.startsWith("total"));

    return lines.map(line => {
      const parts = line.split(/\s+/);
      if (parts.length < 9) return null;
      const isDir = parts[0].startsWith("d");
      const size = isDir ? null : parseInt(parts[4]) || null;
      const name = parts.slice(8).join(" ");
      if (name === "." || name === "..") return null;
      return {
        name,
        path: `${path.replace(/\/$/, "")}/${name}`,
        isDirectory: isDir,
        size,
        modifiedAt: `${parts[5]} ${parts[6]}`,
      };
    }).filter(Boolean) as { name: string; path: string; isDirectory: boolean; size: number | null; modifiedAt: string | null }[];
  }

  async readFile(serverId: number, path: string): Promise<string> {
    const conn = this.connections.get(serverId);
    if (!conn) throw new Error("Not connected to server");

    const result = await conn.ssh.execCommand(`cat "${path}"`);
    if (result.code !== 0 && result.stderr) throw new Error(result.stderr);
    return result.stdout;
  }

  async writeFile(serverId: number, path: string, content: string): Promise<void> {
    const conn = this.connections.get(serverId);
    if (!conn) throw new Error("Not connected to server");

    const escaped = content.replace(/'/g, "'\"'\"'");
    await conn.ssh.execCommand(`echo '${escaped}' > "${path}"`);
  }

  async deleteFile(serverId: number, path: string): Promise<void> {
    const conn = this.connections.get(serverId);
    if (!conn) throw new Error("Not connected to server");
    await conn.ssh.execCommand(`rm -rf "${path}"`);
  }

  async sendCommand(serverId: number, command: string): Promise<string> {
    const conn = this.connections.get(serverId);
    if (!conn) throw new Error("Not connected to server");

    const result = await conn.ssh.execCommand(command);
    return result.stdout || result.stderr || "Command executed";
  }
}

export const sshService = new SSHService();
