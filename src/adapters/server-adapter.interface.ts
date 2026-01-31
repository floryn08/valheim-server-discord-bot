import { CommandInteraction } from "discord.js";

export interface ServerAdapter {
  start(interaction: CommandInteraction, serverId: string): Promise<void>;
  stop(interaction: CommandInteraction, serverId: string): Promise<void>;
  status(interaction: CommandInteraction, serverId: string): Promise<void>;
}
