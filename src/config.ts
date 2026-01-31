import { Config } from "./types/config.type";
import { RuntimeMode } from "./types/runtime-mode.type";
import { ServerConfig } from "./types/server-config.type";
import dotenv from "dotenv";

dotenv.config();

// Utility to ensure required env vars exist
const required = (key: string, fallback?: string): string => {
  const val = process.env[key] ?? fallback;
  if (val === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

const runtimeMode = (process.env.RUNTIME_MODE || "kubernetes") as RuntimeMode;

if (runtimeMode !== "kubernetes" && runtimeMode !== "docker") {
  throw new Error(`Invalid RUNTIME_MODE: ${runtimeMode}. Must be 'kubernetes' or 'docker'`);
}

// Parse SERVERS env var as JSON array
const parseServers = (): ServerConfig[] => {
  const serversJson = required("SERVERS");
  try {
    const servers = JSON.parse(serversJson) as ServerConfig[];
    if (!Array.isArray(servers) || servers.length === 0) {
      throw new Error("SERVERS must be a non-empty JSON array");
    }
    // Validate each server config
    for (const server of servers) {
      if (!server.id || !server.serverName) {
        throw new Error("Each server must have 'id' and 'serverName' properties");
      }
      if (!server.startedLogPattern) {
        throw new Error(`Server '${server.id}' must have 'startedLogPattern' property`);
      }
      if (runtimeMode === "kubernetes" && !server.deploymentName) {
        throw new Error(`Server '${server.id}' must have 'deploymentName' for Kubernetes mode`);
      }
      if (runtimeMode === "docker" && !server.containerName) {
        throw new Error(`Server '${server.id}' must have 'containerName' for Docker mode`);
      }
    }
    return servers;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`SERVERS environment variable is not valid JSON: ${error.message}`);
    }
    throw error;
  }
};

export const servers: ServerConfig[] = parseServers();

export const getServerById = (id: string): ServerConfig | undefined => {
  return servers.find((s) => s.id === id);
};

export const config: Config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildIds: required("GUILD_IDS"),
  runtimeMode,
  // Kubernetes-specific (only required if using Kubernetes)
  namespace: runtimeMode === "kubernetes" ? required("NAMESPACE") : process.env.NAMESPACE,
  // Docker-specific
  dockerSocketPath: process.env.DOCKER_SOCKET_PATH,
  // Common
  joinCodeLoopCount: Number.parseInt(process.env.JOIN_CODE_LOOP_COUNT ?? "20", 10),
  joinCodeLoopTimeoutMillis: Number.parseInt(
    process.env.JOIN_CODE_LOOP_TIMEOUT_MILLIS ?? "5000",
    10
  ),
};
