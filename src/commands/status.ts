import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import { status } from "../utils/utils";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Checks the Valheim server status.");

export async function execute(interaction: CommandInteraction) {
  await status(interaction);
}
