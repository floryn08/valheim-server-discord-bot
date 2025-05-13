import { Interaction, SlashCommandBuilder } from "discord.js";

import { start } from "../utils/utils.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("Starts the Valheim server."),
  async execute(interaction: Interaction) {
    await start(interaction);
  },
};
