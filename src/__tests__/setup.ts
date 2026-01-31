// Set up test environment variables
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.GUILD_IDS = 'test-guild-id';
process.env.NAMESPACE = 'test-namespace';
process.env.SERVERS = JSON.stringify([
  {
    id: 'valheim',
    resourceName: 'valheim-deployment',
    resourceType: 'deployment',
    containerName: 'valheim-container',
    serverName: 'My Valheim Server',
    startedLogPattern: 'Session "My Valheim Server" with join code',
    joinCodeWordIndex: 5,
  },
  {
    id: 'terraria',
    resourceName: 'terraria-statefulset',
    resourceType: 'statefulset',
    containerName: 'terraria-container',
    serverName: 'My Terraria Server',
    startedLogPattern: 'Server started',
  },
]);
process.env.JOIN_CODE_LOOP_COUNT = '20';
process.env.JOIN_CODE_LOOP_TIMEOUT_MILLIS = '5000';
