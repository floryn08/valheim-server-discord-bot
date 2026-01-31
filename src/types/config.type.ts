import { RuntimeMode } from "./runtime-mode.type";

export type Config = {
  token: string;
  clientId: string;
  guildIds: string;
  runtimeMode: RuntimeMode;
  // Kubernetes-specific
  namespace?: string;
  // Docker-specific
  dockerSocketPath?: string;
  // Common
  joinCodeLoopCount: number;
  joinCodeLoopTimeoutMillis: number;
};
