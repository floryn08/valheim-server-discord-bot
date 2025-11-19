import { REST, Routes } from 'discord.js';

describe('Discord.js REST API', () => {
  it('should verify REST and Routes are available', () => {
    expect(REST).toBeDefined();
    expect(Routes).toBeDefined();
    expect(Routes.applicationGuildCommands).toBeDefined();
  });

  it('should verify REST.setToken method exists', () => {
    const rest = new REST();
    expect(rest.setToken).toBeDefined();
    expect(typeof rest.setToken).toBe('function');
  });

  it('should verify Routes.applicationGuildCommands signature', () => {
    const route = Routes.applicationGuildCommands('client-id', 'guild-id');
    expect(typeof route).toBe('string');
    expect(route).toContain('client-id');
    expect(route).toContain('guild-id');
  });
});
