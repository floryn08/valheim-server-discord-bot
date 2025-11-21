import Docker from "dockerode";
import { CommandInteraction } from "discord.js";
import { config } from "../config";
import { ServerAdapter } from "./server-adapter.interface";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DockerAdapter implements ServerAdapter {
  private readonly docker: Docker;
  private readonly containerName: string;

  constructor() {
    if (!config.containerName) {
      throw new Error("CONTAINER_NAME is required for Docker mode");
    }

    this.containerName = config.containerName;

    // Initialize Docker client with optional socket path
    const dockerOptions: Docker.DockerOptions = config.dockerSocketPath
      ? { socketPath: config.dockerSocketPath }
      : {};

    this.docker = new Docker(dockerOptions);
  }

  private async getContainer(): Promise<Docker.Container> {
    const container = this.docker.getContainer(this.containerName);
    
    // Verify container exists
    try {
      await container.inspect();
      return container;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Container ${this.containerName} not found: ${errorMessage}`);
    }
  }

  private async getJoinCodeFromLogs(container: Docker.Container): Promise<string> {
    const logOptions = {
      stdout: true,
      stderr: true,
      tail: 10,
    };

    const logStream = await container.logs(logOptions);
    const logs = logStream.toString("utf8");

    const index = logs.indexOf(`Session "${config.serverName}" with join code`);
    if (index !== -1) {
      const words = logs.slice(index).split(" ");
      return words[5]; // The join code is at index 5
    }

    return "";
  }

  async start(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Starting server...");
    console.log("Starting server...");

    try {
      const container = await this.getContainer();
      const info = await container.inspect();

      // Start container if it's not running
      if (info.State.Running) {
        console.log(`Container ${this.containerName} is already running`);
      } else {
        await container.start();
        console.log(`Container ${this.containerName} started`);
      }

      // Wait for the container to initialize
      await delay(config.joinCodeLoopTimeoutMillis);

      let joinCode: string = "";

      // Poll for join code in logs
      for (let i = 0; i < config.joinCodeLoopCount; i++) {
        try {
          joinCode = await this.getJoinCodeFromLogs(container);

          if (joinCode) {
            await interaction.followUp(
              `Server started successfully! Join code is ${joinCode}`
            );
            console.log("Server started successfully! Join code is", joinCode);
            break;
          }

          console.log("Join code not present yet, retrying...");
        } catch (error) {
          console.error("Error reading logs:", error);
        }

        await delay(config.joinCodeLoopTimeoutMillis);
      }

      if (joinCode) {
        await interaction.followUp("Server is running!");
      } else {
        await interaction.followUp(
          "Server is running, but join code could not be retrieved from logs."
        );
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await interaction.followUp(`❌ Failed to start server: ${errorMessage}`);
    }
  }

  async stop(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Stopping server...");
    console.log("Stopping server...");

    try {
      const container = await this.getContainer();
      const info = await container.inspect();

      // Stop container if it's running
      if (info.State.Running) {
        await container.stop();
        console.log(`Container ${this.containerName} stopped`);
      } else {
        console.log(`Container ${this.containerName} is already stopped`);
      }

      await interaction.followUp("Server is stopped!");
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await interaction.followUp(`❌ Failed to stop server: ${errorMessage}`);
    }
  }

  async status(interaction: CommandInteraction): Promise<void> {
    await interaction.reply("Getting server status...");
    console.log("Getting server status...");

    try {
      const container = await this.getContainer();
      const info = await container.inspect();

      if (info.State.Running) {
        await interaction.followUp("✔ Server is running!");
      } else {
        await interaction.followUp("✔ Server is stopped!");
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await interaction.followUp(`❌ Failed to get server status: ${errorMessage}`);
    }
  }
}
