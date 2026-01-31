import Docker from "dockerode";
import { CommandInteraction } from "discord.js";
import { config, getServerById } from "../config";
import { ServerAdapter } from "./server-adapter.interface";
import { ServerConfig } from "../types/server-config.type";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DockerAdapter implements ServerAdapter {
  private readonly docker: Docker;

  constructor() {
    // Initialize Docker client with optional socket path
    const dockerOptions: Docker.DockerOptions = config.dockerSocketPath
      ? { socketPath: config.dockerSocketPath }
      : {};

    this.docker = new Docker(dockerOptions);
  }

  private getServer(serverId: string): ServerConfig {
    const server = getServerById(serverId);
    if (!server) {
      throw new Error(`Server '${serverId}' not found in configuration`);
    }
    return server;
  }

  private async getContainer(containerName: string): Promise<Docker.Container> {
    const container = this.docker.getContainer(containerName);
    
    // Verify container exists
    try {
      await container.inspect();
      return container;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Container ${containerName} not found: ${errorMessage}`);
    }
  }

  private async checkServerStarted(container: Docker.Container, server: ServerConfig): Promise<{ started: boolean; joinCode?: string }> {
    const logOptions = {
      stdout: true,
      stderr: true,
      tail: 10,
    };

    const logStream = await container.logs(logOptions);
    const logs = logStream.toString("utf8");

    const index = logs.indexOf(server.startedLogPattern);
    if (index !== -1) {
      let joinCode: string | undefined;
      // Extract join code if joinCodeWordIndex is configured
      if (server.joinCodeWordIndex !== undefined) {
        const words = logs.slice(index).split(" ");
        joinCode = words[server.joinCodeWordIndex];
      }
      return { started: true, joinCode };
    }

    return { started: false };
  }

  async start(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Starting ${server.id} server...`);
    console.log(`Starting ${server.id} server...`);

    try {
      const container = await this.getContainer(server.containerName);
      const info = await container.inspect();

      // Start container if it's not running
      if (info.State.Running) {
        console.log(`Container ${server.containerName} is already running`);
      } else {
        await container.start();
        console.log(`Container ${server.containerName} started`);
      }

      // Wait for the container to initialize
      await delay(config.joinCodeLoopTimeoutMillis);

      let serverStarted = false;
      let joinCode: string | undefined;

      // Poll for server started in logs
      for (let i = 0; i < config.joinCodeLoopCount; i++) {
        try {
          const result = await this.checkServerStarted(container, server);
          serverStarted = result.started;
          joinCode = result.joinCode;

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
            break;
          }

          console.log("Server not started yet, retrying...");
        } catch (error) {
          console.error("Error reading logs:", error);
        }

        await delay(config.joinCodeLoopTimeoutMillis);
      }

      if (!serverStarted) {
        await interaction.followUp(
          `${server.id} server is running, but startup confirmation could not be detected from logs.`
        );
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await interaction.followUp(`❌ Failed to start ${server.id} server: ${errorMessage}`);
    }
  }

  async stop(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Stopping ${server.id} server...`);
    console.log(`Stopping ${server.id} server...`);

    try {
      const container = await this.getContainer(server.containerName);
      const info = await container.inspect();

      // Stop container if it's running
      if (info.State.Running) {
        await container.stop();
        console.log(`Container ${server.containerName} stopped`);
      } else {
        console.log(`Container ${server.containerName} is already stopped`);
      }

      await interaction.followUp(`${server.id} server is stopped!`);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await interaction.followUp(`❌ Failed to stop ${server.id} server: ${errorMessage}`);
    }
  }

  async status(interaction: CommandInteraction, serverId: string): Promise<void> {
    const server = this.getServer(serverId);
    await interaction.reply(`Getting ${server.id} server status...`);
    console.log(`Getting ${server.id} server status...`);

    try {
      const container = await this.getContainer(server.containerName);
      const info = await container.inspect();

      if (info.State.Running) {
        await interaction.followUp(`✔ ${server.id} server is running!`);
      } else {
        await interaction.followUp(`✔ ${server.id} server is stopped!`);
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await interaction.followUp(`❌ Failed to get ${server.id} server status: ${errorMessage}`);
    }
  }
}
