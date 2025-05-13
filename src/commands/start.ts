import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import { start } from "../utils/utils.js";

export const data = new SlashCommandBuilder()
  .setName("start")
  .setDescription("Starts the Valheim server.");

export async function execute(interaction: CommandInteraction) {
  await start(interaction);
}
