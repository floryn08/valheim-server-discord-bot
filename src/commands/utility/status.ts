import { Interaction, SlashCommandBuilder } from "discord.js";

const { status }  = require("../../utils/utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Checks the Valheim server status.'),
	async execute(interaction: Interaction) {
		await status(interaction);
	},
};