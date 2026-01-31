export type ServerConfig = {
  /** Unique identifier for the server (e.g., "valheim", "terraria") */
  id: string;
  /** Deployment name for Kubernetes mode */
  deploymentName: string;
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
};
