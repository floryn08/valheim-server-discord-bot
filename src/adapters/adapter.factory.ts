import { config } from "../config";
import { ServerAdapter } from "./server-adapter.interface";
import { KubernetesAdapter } from "./kubernetes.adapter";
import { DockerAdapter } from "./docker.adapter";

export function createServerAdapter(): ServerAdapter {
  switch (config.runtimeMode) {
    case "kubernetes":
      return new KubernetesAdapter();
    case "docker":
      return new DockerAdapter();
    default:
      throw new Error(`Unsupported runtime mode: ${config.runtimeMode}`);
  }
}
