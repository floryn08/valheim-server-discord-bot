import { CommandInteraction } from "discord.js";

export interface ServerAdapter {
  start(interaction: CommandInteraction): Promise<void>;
  stop(interaction: CommandInteraction): Promise<void>;
  status(interaction: CommandInteraction): Promise<void>;
}
