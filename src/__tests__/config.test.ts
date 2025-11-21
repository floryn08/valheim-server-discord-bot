import { config } from '../config';

describe('Config', () => {
  describe('required environment variables', () => {
    it('should load all required config values from environment', () => {
      expect(config.token).toBeDefined();
      expect(config.clientId).toBeDefined();
      expect(config.guildIds).toBeDefined();
      expect(config.runtimeMode).toBeDefined();
      expect(config.serverName).toBeDefined();
      
      // Runtime-specific checks
      if (config.runtimeMode === 'kubernetes') {
        expect(config.deploymentName).toBeDefined();
        expect(config.namespace).toBeDefined();
      } else if (config.runtimeMode === 'docker') {
        expect(config.containerName).toBeDefined();
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

  describe('config validation', () => {
    it('should parse joinCodeLoopCount as number', () => {
      expect(Number.isInteger(config.joinCodeLoopCount)).toBe(true);
    });

    it('should parse joinCodeLoopTimeoutMillis as number', () => {
      expect(Number.isInteger(config.joinCodeLoopTimeoutMillis)).toBe(true);
    });
  });
});
