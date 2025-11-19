import { Client, Events, GatewayIntentBits } from 'discord.js';

describe('Discord.js Client API', () => {
  it('should verify required Discord.js exports exist', () => {
    expect(Client).toBeDefined();
    expect(GatewayIntentBits).toBeDefined();
    expect(Events).toBeDefined();
  });

  it('should verify GatewayIntentBits has required values', () => {
    expect(GatewayIntentBits.Guilds).toBeDefined();
    expect(GatewayIntentBits.GuildMessages).toBeDefined();
    expect(GatewayIntentBits.DirectMessages).toBeDefined();
  });

  it('should verify Events has required values', () => {
    expect(Events.ClientReady).toBe('ready');
    expect(Events.InteractionCreate).toBe('interactionCreate');
  });

  it('should create client with intents and verify methods', () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    
    expect(client.once).toBeDefined();
    expect(client.on).toBeDefined();
    expect(client.login).toBeDefined();
    
    client.destroy();
  });

  it('should verify intents are required in Client constructor', () => {
    let error: Error | null = null;
    try {
      const client = new Client({} as any);
      client.destroy();
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeTruthy();
  });
});
