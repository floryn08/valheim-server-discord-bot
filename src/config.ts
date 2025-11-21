import { Config } from "./types/config.type";
import { RuntimeMode } from "./types/runtime-mode.type";
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

export const config: Config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildIds: required("GUILD_IDS"),
  runtimeMode,
  // Kubernetes-specific (only required if using Kubernetes)
  deploymentName: runtimeMode === "kubernetes" ? required("DEPLOYMENT_NAME") : process.env.DEPLOYMENT_NAME,
  namespace: runtimeMode === "kubernetes" ? required("NAMESPACE") : process.env.NAMESPACE,
  // Docker-specific (only required if using Docker)
  containerName: runtimeMode === "docker" ? required("CONTAINER_NAME") : process.env.CONTAINER_NAME,
  dockerSocketPath: process.env.DOCKER_SOCKET_PATH,
  // Common
  serverName: required("SERVER_NAME"),
  joinCodeLoopCount: Number.parseInt(process.env.JOIN_CODE_LOOP_COUNT ?? "20", 10),
  joinCodeLoopTimeoutMillis: Number.parseInt(
    process.env.JOIN_CODE_LOOP_TIMEOUT_MILLIS ?? "5000",
    10
  ),
};
