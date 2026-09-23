import { Client, DiscordAPIError, Events, GatewayIntentBits } from "discord.js";
import { commands } from "./commands/index";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import { KubernetesAdapter } from "./adapters/kubernetes.adapter";

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
  if (config.runtimeMode === "kubernetes") {
    new KubernetesAdapter().startAutoStopMonitors(client);
  }
});

function isUnknownInteraction(error: unknown): boolean {
  return error instanceof DiscordAPIError && error.code === 10062;
}

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle autocomplete interactions
  if (interaction.isAutocomplete()) {
    const { commandName } = interaction;
    const command = commands[commandName as keyof typeof commands];
    if (command && "autocomplete" in command) {
      try {
        await command.autocomplete(interaction);
      } catch (error: unknown) {
        // Autocomplete interactions expire quickly; a stale response must not crash the bot.
        if (isUnknownInteraction(error)) {
          console.warn("Autocomplete interaction expired before it could be answered.");
        } else {
          console.error("Failed to answer autocomplete interaction:", error);
        }
      }
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