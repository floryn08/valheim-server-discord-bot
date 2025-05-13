import { Interaction, SlashCommandBuilder } from "discord.js";

import { stop } from "../utils/utils.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the Valheim server.'),
	async execute(interaction: Interaction) {
		await stop(interaction);
	},
};