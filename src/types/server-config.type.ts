/** Kubernetes resource type for scaling */
export type KubernetesResourceType = "deployment" | "statefulset";

export type AutoStopConfig = {
  /**
   * Regular expression with a capture group containing the current player count.
   * The newest matching log line is authoritative.
   */
  playerCountLogPattern: string;
  /** How long the server must remain empty before it is stopped. Defaults to 30 minutes. */
  idleTimeoutMillis?: number;
  /** How often the bot polls the pod log. Defaults to 30 seconds. */
  checkIntervalMillis?: number;
};

export type ServerConfig = {
  /** Unique identifier for the server (e.g., "valheim", "terraria") */
  id: string;
  /** Resource name for Kubernetes mode (Deployment or StatefulSet name) */
  resourceName: string;
  /** 
   * Kubernetes resource type. Defaults to "deployment" if not specified.
   * Use "statefulset" for games like Terraria that need persistent storage.
   */
  resourceType?: KubernetesResourceType;
  /** Container name for Docker mode */
  containerName: string;
  /** Display name for the server (used in messages) */
  serverName: string;
  /**
   * Pattern to search for in logs to detect server has started.
   * Examples:
   *   - Valheim: 'Session "My Server" with join code'
   *   - Terraria: 'Server started'
   */
  startedLogPattern: string;
  /**
   * If provided, extracts the word at this index (0-based) from the matched log line as join code.
   * The index is relative to the start of the matched pattern.
   * Example: For 'Session "My Server" with join code ABC123', index 5 extracts 'ABC123'
   * If not provided, no join code will be extracted.
   */
  joinCodeWordIndex?: number;
  /**
   * Opt-in Kubernetes log-based idle shutdown. This is useful for crossplay
   * servers where a UDP status query cannot report the player count.
   */
  autoStop?: AutoStopConfig;
};
