import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { commands } from "./commands";
import { config } from "./config";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST().setToken(config.token);

export async function deployCommands() {
  try {
    console.log(
      `Started refreshing ${Object.keys(commands).length} application (/) commands.`
    );

    const guildIds = config.guildIds.split(",");

    for (const guildId of guildIds) {
      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, guildId),
        { body: commandsData }
      ) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

      console.log(
        `Successfully reloaded ${data.length} application (/) commands for guildId: ${guildId}`
      );
    }
  } catch (error: unknown) {
    console.error(error);
  }
}
