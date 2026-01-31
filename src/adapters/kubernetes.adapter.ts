import * as k8s from "@kubernetes/client-node";
import { CommandInteraction } from "discord.js";
import { config, getServerById } from "../config";
import { ServerAdapter } from "./server-adapter.interface";
import { ServerConfig } from "../types/server-config.type";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  async start(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Starting ${server.id} server...`);
    console.log(`Starting ${server.id} server...`);

    // find the particular deployment
    const res = await this.appsK8sApi.readNamespacedDeployment({
      name: server.deploymentName,
      namespace: this.namespace,
    });

    // edit
    res.spec!.replicas = 1;

    // replace
    await this.appsK8sApi
      .replaceNamespacedDeployment({
        name: server.deploymentName,
        namespace: this.namespace,
        body: res,
      })
      .then(async () => {
        // wait after starting the container because it may have some old logs
        // and the old join code may be returned, so we wait a bit for the new container
        // to log some new lines and then start the check loop
        await delay(config.joinCodeLoopTimeoutMillis);

        let podObj: k8s.V1Pod | undefined;
        let podContainer: k8s.V1Container | undefined;

        await this.coreK8sApi
          .listNamespacedPod({ namespace: this.namespace })
          .then((podList: k8s.V1PodList) => {
            for (const pod of podList.items) {
              const labels = pod.metadata?.labels;
              if (
                labels &&
                labels["app.kubernetes.io/name"] == server.deploymentName
              ) {
                podObj = pod;
                for (const container of pod.spec!.containers) {
                  podContainer = container;
                }
              }
            }
          });

        if (!podObj || !podContainer) {
          await interaction.followUp(
            "❌ Failed to find the server pod or container."
          );
          console.error("Failed to find the server pod or container.");
          return;
        }

        console.log("pod: ", podObj.metadata?.name);
        console.log("container:", podContainer.name);

        let serverStarted = false;
        let joinCode: string | undefined;

        for (let i = 0; i < config.joinCodeLoopCount; i++) {
          await this.coreK8sApi
            .readNamespacedPodLog({
              name: podObj.metadata?.name as string,
              namespace: this.namespace,
              container: podContainer.name,
              follow: false,
              pretty: "true",
              tailLines: 10,
            })
            .then((log) => {
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
            });

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
      });
  }

  async stop(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Stopping ${server.id} server...`);
    console.log(`Stopping ${server.id} server...`);

    // find the particular deployment
    const deployment = await this.appsK8sApi.readNamespacedDeployment({
      name: server.deploymentName,
      namespace: this.namespace,
    });

    // edit
    deployment.spec!.replicas = 0;

    // replace
    await this.appsK8sApi.replaceNamespacedDeployment({
      name: server.deploymentName,
      namespace: this.namespace,
      body: deployment,
    });

    await interaction.followUp(`${server.id} server is stopped!`);
    console.log(`${server.id} server is stopped!`);
  }

  async status(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Getting ${server.id} server status...`);
    console.log(`Getting ${server.id} server status...`);

    try {
      // find the particular deployment
      const deployment = await this.appsK8sApi.readNamespacedDeployment({
        name: server.deploymentName,
        namespace: this.namespace,
      });

      if (deployment.spec?.replicas == 0) {
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
