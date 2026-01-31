import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands } from "./commands/index";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";

// Initialize a new Discord client and log in using the Bot Token.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  deployCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle autocomplete interactions
  if (interaction.isAutocomplete()) {
    const { commandName } = interaction;
    const command = commands[commandName as keyof typeof commands];
    if (command && "autocomplete" in command) {
      await command.autocomplete(interaction);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

// Connect to the server once the bot is ready.
client.login(config.token);