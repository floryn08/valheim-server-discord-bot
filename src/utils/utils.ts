import { CommandInteraction } from "discord.js";
import { createServerAdapter } from "../adapters/adapter.factory";

const serverAdapter = createServerAdapter();

export const start = async (interaction: CommandInteraction) => {
  await serverAdapter.start(interaction);
};

export const stop = async (interaction: CommandInteraction) => {
  await serverAdapter.stop(interaction);
};

export const status = async (
  interaction: CommandInteraction
): Promise<void> => {
  await serverAdapter.status(interaction);
};
