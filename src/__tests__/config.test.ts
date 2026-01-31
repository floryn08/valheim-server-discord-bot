import { config, servers, getServerById } from '../config';

describe('Config', () => {
  describe('required environment variables', () => {
    it('should load all required config values from environment', () => {
      expect(config.token).toBeDefined();
      expect(config.clientId).toBeDefined();
      expect(config.guildIds).toBeDefined();
      expect(config.runtimeMode).toBeDefined();
      
      // Runtime-specific checks
      if (config.runtimeMode === 'kubernetes') {
        expect(config.namespace).toBeDefined();
      }
    });

    it('should have correct types for numeric values', () => {
      expect(typeof config.joinCodeLoopCount).toBe('number');
      expect(typeof config.joinCodeLoopTimeoutMillis).toBe('number');
    });

    it('should use default values for optional numeric configs', () => {
      expect(config.joinCodeLoopCount).toBeGreaterThan(0);
      expect(config.joinCodeLoopTimeoutMillis).toBeGreaterThan(0);
    });

    it('should have valid runtime mode', () => {
      expect(['kubernetes', 'docker']).toContain(config.runtimeMode);
    });
  });

  describe('servers configuration', () => {
    it('should load servers from SERVERS env var', () => {
      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);
    });

    it('should have valid server configurations', () => {
      for (const server of servers) {
        expect(server.id).toBeDefined();
        expect(server.serverName).toBeDefined();
        expect(server.deploymentName).toBeDefined();
        expect(server.containerName).toBeDefined();
        expect(server.startedLogPattern).toBeDefined();
      }
    });

    it('should have optional joinCodeWordIndex for servers that support it', () => {
      const valheim = getServerById('valheim');
      expect(valheim?.joinCodeWordIndex).toBe(5);
      
      const terraria = getServerById('terraria');
      expect(terraria?.joinCodeWordIndex).toBeUndefined();
    });

    it('should find server by id', () => {
      const valheim = getServerById('valheim');
      expect(valheim).toBeDefined();
      expect(valheim?.id).toBe('valheim');
    });

    it('should return undefined for unknown server id', () => {
      const unknown = getServerById('unknown-server');
      expect(unknown).toBeUndefined();
    });
  });

  describe('config validation', () => {
    it('should parse joinCodeLoopCount as number', () => {
      expect(Number.isInteger(config.joinCodeLoopCount)).toBe(true);
    });

    it('should parse joinCodeLoopTimeoutMillis as number', () => {
      expect(Number.isInteger(config.joinCodeLoopTimeoutMillis)).toBe(true);
    });
  });
});
