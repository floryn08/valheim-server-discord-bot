import * as k8s from "@kubernetes/client-node";
import { Client, CommandInteraction } from "discord.js";
import { config, getServerById, servers } from "../config";
import { ServerAdapter } from "./server-adapter.interface";
import { ServerConfig } from "../types/server-config.type";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_AUTO_STOP_IDLE_TIMEOUT_MILLIS = 30 * 60 * 1000;
const DEFAULT_AUTO_STOP_CHECK_INTERVAL_MILLIS = 30 * 1000;
const AUTO_STOP_WARNING_MILLIS = 5 * 60 * 1000;

/** Returns the player count from the newest matching server-log line. */
export function getLatestPlayerCount(log: string, pattern: string): number | undefined {
  const expression = new RegExp(pattern, "gm");
  let playerCount: number | undefined;

  for (const match of log.matchAll(expression)) {
    const capture = match.slice(1).find((value) => value !== undefined);
    if (capture === undefined) continue;

    const parsed = Number.parseInt(capture, 10);
    if (Number.isFinite(parsed) && parsed >= 0) playerCount = parsed;
  }

  return playerCount;
}

export class KubernetesAdapter implements ServerAdapter {
  private readonly namespace: string;
  private readonly appsK8sApi: k8s.AppsV1Api;
  private readonly coreK8sApi: k8s.CoreV1Api;

  constructor() {
    if (!config.namespace) {
      throw new Error("NAMESPACE is required for Kubernetes mode");
    }

    this.namespace = config.namespace;

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.appsK8sApi = kc.makeApiClient(k8s.AppsV1Api);
    this.coreK8sApi = kc.makeApiClient(k8s.CoreV1Api);
  }

  private getServer(serverId: string): ServerConfig {
    const server = getServerById(serverId);
    if (!server) {
      throw new Error(`Server '${serverId}' not found in configuration`);
    }
    return server;
  }

  private async scaleResource(server: ServerConfig, replicas: number): Promise<void> {
    const resourceType = server.resourceType || "deployment";

    if (resourceType === "statefulset") {
      const statefulSet = await this.appsK8sApi.readNamespacedStatefulSet({
        name: server.resourceName,
        namespace: this.namespace,
      });
      statefulSet.spec!.replicas = replicas;
      await this.appsK8sApi.replaceNamespacedStatefulSet({
        name: server.resourceName,
        namespace: this.namespace,
        body: statefulSet,
      });
    } else {
      const deployment = await this.appsK8sApi.readNamespacedDeployment({
        name: server.resourceName,
        namespace: this.namespace,
      });
      deployment.spec!.replicas = replicas;
      await this.appsK8sApi.replaceNamespacedDeployment({
        name: server.resourceName,
        namespace: this.namespace,
        body: deployment,
      });
    }
  }

  private async getResourceReplicas(server: ServerConfig): Promise<number> {
    const resourceType = server.resourceType || "deployment";

    if (resourceType === "statefulset") {
      const statefulSet = await this.appsK8sApi.readNamespacedStatefulSet({
        name: server.resourceName,
        namespace: this.namespace,
      });
      return statefulSet.spec?.replicas ?? 0;
    } else {
      const deployment = await this.appsK8sApi.readNamespacedDeployment({
        name: server.resourceName,
        namespace: this.namespace,
      });
      return deployment.spec?.replicas ?? 0;
    }
  }

  private async findServerPod(server: ServerConfig): Promise<k8s.V1Pod | undefined> {
    const podList = await this.coreK8sApi.listNamespacedPod({ namespace: this.namespace });
    return podList.items.find(
      (pod) => pod.metadata?.labels?.["app.kubernetes.io/name"] === server.resourceName
    );
  }

  private async sendAutoStopNotification(client: Client, message: string): Promise<void> {
    let notificationSent = false;
    for (const guildId of config.guildIds.split(",").map((id) => id.trim()).filter(Boolean)) {
      try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild.systemChannel) {
          console.warn("Guild " + guildId + " has no system channel for auto-stop notifications.");
          continue;
        }
        await guild.systemChannel.send(message);
        notificationSent = true;
      } catch (error: unknown) {
        console.error("Failed to send auto-stop notification to guild " + guildId + ":", error);
      }
    }
    if (!notificationSent) {
      console.warn("No configured guild system channel accepted the auto-stop notification.");
    }
  }

  /**
   * Starts one independent log monitor for every Kubernetes server that opted in
   * to auto-stop. A bot restart resets the idle timer, which is intentionally
   * conservative: a server must be observed empty for the full timeout.
   */
  startAutoStopMonitors(client: Client): void {
    for (const server of config.runtimeMode === "kubernetes" ? servers : []) {
      if (!server.autoStop) continue;

      let emptySince: number | undefined;
      let warningSent = false;
      let checking = false;
      const idleTimeoutMillis = server.autoStop.idleTimeoutMillis ?? DEFAULT_AUTO_STOP_IDLE_TIMEOUT_MILLIS;
      const checkIntervalMillis = server.autoStop.checkIntervalMillis ?? DEFAULT_AUTO_STOP_CHECK_INTERVAL_MILLIS;

      const check = async () => {
        if (checking) return;
        checking = true;
        try {
          if ((await this.getResourceReplicas(server)) === 0) {
            emptySince = undefined;
            warningSent = false;
            return;
          }

          const pod = await this.findServerPod(server);
          if (!pod?.metadata?.name) return;

          const log = await this.coreK8sApi.readNamespacedPodLog({
            name: pod.metadata.name,
            namespace: this.namespace,
            container: server.containerName,
            follow: false,
            tailLines: 500,
          });
          const playerCount = getLatestPlayerCount(log, server.autoStop!.playerCountLogPattern);
          if (playerCount === undefined) return;

          if (playerCount > 0) {
            emptySince = undefined;
            warningSent = false;
            return;
          }

          emptySince ??= Date.now();
          const warningMillis = Math.min(AUTO_STOP_WARNING_MILLIS, idleTimeoutMillis);
          if (!warningSent && Date.now() - emptySince >= idleTimeoutMillis - warningMillis) {
            await this.sendAutoStopNotification(
              client,
              "⚠️ " + server.serverName + " has no players and will stop in " + Math.ceil(warningMillis / 60000) + " minutes unless someone joins."
            );
            warningSent = true;
          }
          if (Date.now() - emptySince >= idleTimeoutMillis) {
            await this.scaleResource(server, 0);
            await this.sendAutoStopNotification(client, "🛑 " + server.serverName + " has been stopped after being empty.");
            emptySince = undefined;
            warningSent = false;
            console.log(`${server.id} server stopped after ${idleTimeoutMillis}ms with zero players.`);
          }
        } catch (error: unknown) {
          // A failed API or log read must never be interpreted as an empty server.
          console.error(`Failed to check auto-stop status for ${server.id}:`, error);
        } finally {
          checking = false;
        }
      };

      console.log(`Auto-stop enabled for ${server.id}; idle timeout is ${idleTimeoutMillis}ms.`);
      void check();
      setInterval(() => void check(), checkIntervalMillis);
    }
  }

  async start(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Starting ${server.id} server...`);
    console.log(`Starting ${server.id} server...`);

    // Scale up the resource
    await this.scaleResource(server, 1);

    // wait after starting the container because it may have some old logs
    // and the old join code may be returned, so we wait a bit for the new container
    // to log some new lines and then start the check loop
    await delay(config.joinCodeLoopTimeoutMillis);

    const podObj = await this.findServerPod(server);
    if (!podObj?.metadata?.name) {
      await interaction.followUp("❌ Failed to find the server pod or container.");
      console.error("Failed to find the server pod or container.");
      return;
    }

    console.log("pod: ", podObj.metadata?.name);
    console.log("container:", server.containerName);

    let serverStarted = false;
    let joinCode: string | undefined;

    for (let i = 0; i < config.joinCodeLoopCount; i++) {
      let log: string;
      try {
        log = await this.coreK8sApi.readNamespacedPodLog({
          name: podObj.metadata?.name as string,
          namespace: this.namespace,
          container: server.containerName,
          follow: false,
          pretty: "true",
          tailLines: 10,
        });
      } catch (error: unknown) {
        // Pods may be listed before the container is ready to serve logs.
        console.error("Error reading Kubernetes pod logs, retrying:", error);
        await delay(config.joinCodeLoopTimeoutMillis);
        continue;
      }

      const index = log.indexOf(server.startedLogPattern);
      if (index !== -1) {
        serverStarted = true;
        // Extract join code if joinCodeWordIndex is configured
        if (server.joinCodeWordIndex !== undefined) {
          const words = log.slice(index).split(" ");
          joinCode = words[server.joinCodeWordIndex];
        }
      } else {
        console.log("Server not started yet, retrying...");
      }

      if (serverStarted) {
        if (joinCode) {
          await interaction.followUp(
            `${server.id} server started successfully! Join code is ${joinCode}`
          );
          console.log(`${server.id} server started successfully! Join code is`, joinCode);
        } else {
          await interaction.followUp(`${server.id} server started successfully!`);
          console.log(`${server.id} server started successfully!`);
        }
        return;
      }

      await delay(config.joinCodeLoopTimeoutMillis);
    }

    // If we get here, the loop finished without detecting server started
    await interaction.followUp(
      `${server.id} server is running, but startup confirmation could not be detected from logs.`
    );
  }

  async stop(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Stopping ${server.id} server...`);
    console.log(`Stopping ${server.id} server...`);

    // Scale down the resource
    await this.scaleResource(server, 0);

    await interaction.followUp(`${server.id} server is stopped!`);
    console.log(`${server.id} server is stopped!`);
  }

  async status(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Getting ${server.id} server status...`);
    console.log(`Getting ${server.id} server status...`);

    try {
      const replicas = await this.getResourceReplicas(server);

      if (replicas == 0) {
        await interaction.followUp(`✔ ${server.id} server is stopped!`);
      } else {
        await interaction.followUp(`✔ ${server.id} server is running!`);
      }
    } catch (error: unknown) {
      console.error(error);
      await interaction.followUp(`❌ Failed to get ${server.id} server status.`);
    }
  }
}
