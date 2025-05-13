import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import { stop } from "../utils/utils.js";

export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stops the Valheim server.");

export async function execute(interaction: CommandInteraction) {
  await stop(interaction);
}
