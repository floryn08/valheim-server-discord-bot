import { Config } from "./types/config.type";
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

export const config: Config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildIds: required("GUILD_IDS"),
  deploymentName: required("DEPLOYMENT_NAME"),
  namespace: required("NAMESPACE"),
  serverName: required("SERVER_NAME"),
  joinCodeLoopCount: parseInt(process.env.JOIN_CODE_LOOP_COUNT ?? "20", 10),
  joinCodeLoopTimeoutMillis: parseInt(
    process.env.JOIN_CODE_LOOP_TIMEOUT_MILLIS ?? "5000",
    10
  ),
};
