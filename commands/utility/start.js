const { SlashCommandBuilder } = require('discord.js');
const { start }  = require("../../utils/utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts the Valheim server.'),
	async execute(interaction) {
		await start(interaction);
	},
};