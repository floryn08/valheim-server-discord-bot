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

// Mock config with Kubernetes mode
jest.mock('../config', () => ({
  config: {
    runtimeMode: 'kubernetes',
    deploymentName: 'test-deployment',
    namespace: 'test-namespace',
    serverName: 'test-server',
    joinCodeLoopCount: 2,
    joinCodeLoopTimeoutMillis: 100,
  },
}));

import { CommandInteraction } from 'discord.js';
import { stop, status } from '../utils/utils';

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

      await stop(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalled();
      expect(mockInteraction.followUp).toHaveBeenCalled();
    });
  });

  describe('status', () => {
    it('should handle errors with followUp', async () => {
      mockReadNamespacedDeployment.mockRejectedValue(new Error('K8s error'));

      await status(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith('❌ Failed to get server status.');
    });
  });

  it('should verify interaction methods return Promises', async () => {
    mockReadNamespacedDeployment.mockResolvedValue({ spec: { replicas: 1 } });

    const statusPromise = status(mockInteraction);
    expect(statusPromise).toBeInstanceOf(Promise);
    await statusPromise;
  });
});
