import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { data as startData, execute as startExecute } from '../commands/start';
import { data as stopData } from '../commands/stop';
import { data as statusData } from '../commands/status';

// Mock the utils module
jest.mock('../utils/utils', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  status: jest.fn(),
}));

import * as utils from '../utils/utils';

describe('Discord.js Command API', () => {
  it('should verify SlashCommandBuilder is available and commands use it', () => {
    expect(startData).toBeInstanceOf(SlashCommandBuilder);
    expect(stopData).toBeInstanceOf(SlashCommandBuilder);
    expect(statusData).toBeInstanceOf(SlashCommandBuilder);
  });

  it('should verify commands serialize correctly for Discord API', () => {
    const commands = [startData, stopData, statusData];
    for (const cmd of commands) {
      const json = cmd.toJSON();
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('description');
      expect(json).toHaveProperty('type', 1); // CHAT_INPUT
      expect(json.name).toMatch(/^[a-z0-9_-]{1,32}$/);
      expect(json.description.length).toBeLessThanOrEqual(100);
    }
  });

  it('should verify CommandInteraction has reply and followUp methods', async () => {
    const mockInteraction = {
      reply: jest.fn().mockResolvedValue(undefined),
      followUp: jest.fn().mockResolvedValue(undefined),
    } as unknown as CommandInteraction;

    await startExecute(mockInteraction);
    
    expect(utils.start).toHaveBeenCalledWith(mockInteraction);
    expect(typeof mockInteraction.reply).toBe('function');
    expect(typeof mockInteraction.followUp).toBe('function');
  });
});
