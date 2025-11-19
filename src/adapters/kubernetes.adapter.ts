import * as k8s from "@kubernetes/client-node";
import { CommandInteraction } from "discord.js";
import { config } from "../config";
import { ServerAdapter } from "./server-adapter.interface";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class KubernetesAdapter implements ServerAdapter {
  private readonly deploymentName: string;
  private readonly namespace: string;
  private readonly appsK8sApi: k8s.AppsV1Api;
  private readonly coreK8sApi: k8s.CoreV1Api;

  constructor() {
    if (!config.deploymentName || !config.namespace) {
      throw new Error("DEPLOYMENT_NAME and NAMESPACE are required for Kubernetes mode");
    }

    this.deploymentName = config.deploymentName;
    this.namespace = config.namespace;

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.appsK8sApi = kc.makeApiClient(k8s.AppsV1Api);
    this.coreK8sApi = kc.makeApiClient(k8s.CoreV1Api);
  }

  async start(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Starting server...");
    console.log("Starting server...");

    // find the particular deployment
    const res = await this.appsK8sApi.readNamespacedDeployment({
      name: this.deploymentName,
      namespace: this.namespace,
    });

    // edit
    res.spec!.replicas = 1;

    // replace
    await this.appsK8sApi
      .replaceNamespacedDeployment({
        name: this.deploymentName,
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
        let joinCode: string = "";

        await this.coreK8sApi
          .listNamespacedPod({ namespace: this.namespace })
          .then((podList: k8s.V1PodList) => {
            for (const pod of podList.items) {
              const labels = pod.metadata?.labels;
              if (
                labels &&
                labels["app.kubernetes.io/name"] == config.deploymentName
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
              let index = log.indexOf(
                `Session "${config.serverName}" with join code`
              );
              if (index !== -1) {
                // Get the next word after the string
                let words = log.slice(index).split(" ");
                joinCode = words[5]; // The next word is at index 5
              }

              console.log("Join code not present yet, retrying...");
            });

          if (joinCode != "") {
            await interaction.followUp(
              `Server started successfully! Join code is ${joinCode}`
            );
            console.log("Server started successfully! Join code is", joinCode);

            break;
          }

          await delay(config.joinCodeLoopTimeoutMillis);
        }
      });

    await interaction.followUp("Server is running!");
  }

  async stop(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Stopping server...");
    console.log("Stopping server...");

    // find the particular deployment
    const deployment = await this.appsK8sApi.readNamespacedDeployment({
      name: this.deploymentName,
      namespace: this.namespace,
    });

    // edit
    deployment.spec!.replicas = 0;

    // replace
    await this.appsK8sApi.replaceNamespacedDeployment({
      name: this.deploymentName,
      namespace: this.namespace,
      body: deployment,
    });

    await interaction.followUp("Server is stopped!");
    console.log("Server is stopped!");
  }

  async status(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Getting server status...");
    console.log("Getting server status...");

    try {
      // find the particular deployment
      const deployment = await this.appsK8sApi.readNamespacedDeployment({
        name: this.deploymentName,
        namespace: this.namespace,
      });

      if (deployment.spec?.replicas == 0) {
        await interaction.followUp("✔ Server is stopped!");
      } else {
        await interaction.followUp("✔ Server is running!");
      }
    } catch (error: unknown) {
      console.error(error);
      await interaction.followUp("❌ Failed to get server status.");
    }
  }
}
