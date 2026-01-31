import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { stop } from "../utils/utils";
import { servers } from "../config";

export const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stops a game server.")
  .addStringOption((option) =>
    option
      .setName("server")
      .setDescription("The server to stop")
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const choices = servers.map((s) => ({ name: s.id, value: s.id }));
  const filtered = choices.filter((choice) =>
    choice.name.toLowerCase().includes(focusedValue)
  );
  await interaction.respond(filtered.slice(0, 25));
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const serverId = interaction.options.getString("server", true);
  await stop(interaction, serverId);
}
