// Mock Kubernetes client before importing utils
const mockReadNamespacedDeployment = jest.fn();
const mockReplaceNamespacedDeployment = jest.fn();
const mockListNamespacedPod = jest.fn();
const mockReadNamespacedPodLog = jest.fn();

jest.mock('@kubernetes/client-node', () => {
  return {
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromDefault: jest.fn(),
      makeApiClient: jest.fn((apiType: any) => {
        if (apiType.name === 'AppsV1Api') {
          return {
            readNamespacedDeployment: mockReadNamespacedDeployment,
            replaceNamespacedDeployment: mockReplaceNamespacedDeployment,
          };
        }
        if (apiType.name === 'CoreV1Api') {
          return {
            listNamespacedPod: mockListNamespacedPod,
            readNamespacedPodLog: mockReadNamespacedPodLog,
          };
        }
        return {};
      }),
    })),
    AppsV1Api: class AppsV1Api {},
    CoreV1Api: class CoreV1Api {},
  };
});

// Mock dockerode
jest.mock('dockerode', () => {
  return jest.fn().mockImplementation(() => ({
    getContainer: jest.fn(),
  }));
});

// Mock config with Kubernetes mode and servers
jest.mock('../config', () => ({
  config: {
    runtimeMode: 'kubernetes',
    namespace: 'test-namespace',
    joinCodeLoopCount: 2,
    joinCodeLoopTimeoutMillis: 100,
  },
  servers: [
    {
      id: 'valheim',
      resourceName: 'valheim-deployment',
      resourceType: 'deployment',
      containerName: 'valheim-container',
      serverName: 'Test Valheim Server',
      startedLogPattern: 'Session "Test Valheim Server" with join code',
      joinCodeWordIndex: 5,
    },
  ],
  getServerById: (id: string) => {
    if (id === 'valheim') {
      return {
        id: 'valheim',
        resourceName: 'valheim-deployment',
        resourceType: 'deployment',
        containerName: 'valheim-container',
        serverName: 'Test Valheim Server',
        startedLogPattern: 'Session "Test Valheim Server" with join code',
        joinCodeWordIndex: 5,
      };
    }
    return undefined;
  },
}));

import { CommandInteraction } from 'discord.js';
import { start, stop, status } from '../utils/utils';

describe('Discord.js Interaction API', () => {
  let mockInteraction: CommandInteraction;

  beforeEach(() => {
    mockInteraction = {
      reply: jest.fn().mockResolvedValue(undefined),
      followUp: jest.fn().mockResolvedValue(undefined),
    } as unknown as CommandInteraction;

    jest.clearAllMocks();
  });

  describe('stop', () => {
    it('should use reply and followUp methods', async () => {
      const mockDeployment = { spec: { replicas: 1 } };
      mockReadNamespacedDeployment.mockResolvedValue(mockDeployment);
      mockReplaceNamespacedDeployment.mockResolvedValue({});

      await stop(mockInteraction, 'valheim');

      expect(mockInteraction.reply).toHaveBeenCalled();
      expect(mockInteraction.followUp).toHaveBeenCalled();
    });
  });

  describe('status', () => {
    it('should handle errors with followUp', async () => {
      mockReadNamespacedDeployment.mockRejectedValue(new Error('K8s error'));

      await status(mockInteraction, 'valheim');

      expect(mockInteraction.followUp).toHaveBeenCalledWith('❌ Failed to get valheim server status.');
    });
  });

  it('should verify interaction methods return Promises', async () => {
    mockReadNamespacedDeployment.mockResolvedValue({ spec: { replicas: 1 } });

    const statusPromise = status(mockInteraction, 'valheim');
    expect(statusPromise).toBeInstanceOf(Promise);
    await statusPromise;
  });

  it('retries when Kubernetes rejects logs while the container is creating', async () => {
    mockReadNamespacedDeployment.mockResolvedValue({ spec: { replicas: 0 } });
    mockReplaceNamespacedDeployment.mockResolvedValue({});
    mockListNamespacedPod.mockResolvedValue({
      items: [{
        metadata: {
          name: 'valheim-pod',
          labels: { 'app.kubernetes.io/name': 'valheim-deployment' },
        },
        spec: { containers: [{ name: 'valheim-container' }] },
      }],
    });
    mockReadNamespacedPodLog
      .mockRejectedValueOnce(new Error('container is waiting to start: ContainerCreating'))
      .mockResolvedValueOnce('Session "Test Valheim Server" with join code ABC123');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await expect(start(mockInteraction, 'valheim')).resolves.toBeUndefined();

    expect(mockReadNamespacedPodLog).toHaveBeenCalledTimes(2);
    expect(mockInteraction.followUp).toHaveBeenCalledWith(expect.stringContaining('started successfully'));
    expect(consoleError).toHaveBeenCalledWith(
      'Error reading Kubernetes pod logs, retrying:',
      expect.any(Error)
    );
    consoleError.mockRestore();
  });
});
