import { RuntimeMode } from "./runtime-mode.type";

export type Config = {
  token: string;
  clientId: string;
  guildIds: string;
  runtimeMode: RuntimeMode;
  // Kubernetes-specific
  deploymentName?: string;
  namespace?: string;
  // Docker-specific
  containerName?: string;
  dockerSocketPath?: string;
  // Common
  serverName: string;
  joinCodeLoopCount: number;
  joinCodeLoopTimeoutMillis: number;
};
