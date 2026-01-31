import { CommandInteraction } from "discord.js";
import { createServerAdapter } from "../adapters/adapter.factory";

const serverAdapter = createServerAdapter();

export const start = async (interaction: CommandInteraction, serverId: string) => {
  await serverAdapter.start(interaction, serverId);
};

export const stop = async (interaction: CommandInteraction, serverId: string) => {
  await serverAdapter.stop(interaction, serverId);
};

export const status = async (
  interaction: CommandInteraction,
  serverId: string
): Promise<void> => {
  await serverAdapter.status(interaction, serverId);
};
