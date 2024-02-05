const { SlashCommandBuilder } = require('discord.js');
const { stop }  = require("../../utils/utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the Valheim server.'),
	async execute(interaction) {
		await stop(interaction);
	},
};