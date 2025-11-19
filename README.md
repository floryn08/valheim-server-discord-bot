# Valheim Server Discord Bot
A Discord bot that manages your Valheim server using either Docker or Kubernetes.

This approach minimizes resource consumption since the valheim server docker image I use doesn't support auto pausing the server when there are no players on the server.

The bot registers 3 slash commands:
- /start
- /stop
- /status

## Runtime Modes

The bot supports two runtime modes:
- **kubernetes**: Manages Valheim servers running as Kubernetes deployments
- **docker**: Manages Valheim servers running as Docker containers

Set the runtime mode using the `RUNTIME_MODE` environment variable (defaults to `kubernetes`).


## TODO
- [x] add multiple guilds command refresh
- [x] helm chart release
- [x] improve release workflow
- [x] add docker support alongside kubernetes
- [ ] add odin support

## How to run

### With Kubernetes

#### Prerequisites
- A Kubernetes cluster
- `kubectl` configured to access your cluster
- Helm 3 installed
- (Optional) HashiCorp Vault for secret management

#### Installation Steps

1. **Invite your bot to a Discord server**
   - Use the OAuth2 URL Generator from https://discord.com/developers/applications
   - Select the required bot permissions

2. **Install using Helm**

   ```bash
   # Navigate to the helm chart directory
   cd deployment/helm

   # Install the chart
   helm install valheim-bot . -n game-servers --create-namespace
   ```

3. **Configure the bot**

   The Helm chart supports two configuration methods:

   **Option A: Using ConfigMap (for non-sensitive data)**
   
   Edit the ConfigMap after installation:
   ```bash
   kubectl edit configmap valheim-bot-discord-bot -n game-servers
   ```

   Set the following environment variables:
   - `RUNTIME_MODE`: Set to `kubernetes` (default)
   - `DISCORD_TOKEN`: Your Discord bot token
   - `DISCORD_CLIENT_ID`: Your Discord application client ID
   - `GUILD_IDS`: Comma-separated list of Discord server IDs
   - `DEPLOYMENT_NAME`: The name of your Valheim server deployment in Kubernetes
   - `NAMESPACE`: The namespace where your Valheim server runs (defaults to the chart namespace)
   - `SERVER_NAME`: Your Valheim server name
   - `JOIN_CODE_LOOP_COUNT`: (Optional) Number of retries for join code (default: 20)
   - `JOIN_CODE_LOOP_TIMEOUT_MILLIS`: (Optional) Timeout in milliseconds (default: 5000)

   **Option B: Using HashiCorp Vault (recommended for production)**
   
   If you have Vault enabled (`vault.enabled: true` in values.yaml):
   - Store secrets in Vault at path: `kv/game-servers/valheim-bot-discord-bot`
   - The chart will automatically create a VaultStaticSecret resource

4. **Customize the deployment**

   Create a custom `values.yaml`:
   ```yaml
   namespace: game-servers
   discordBotImage: ghcr.io/floryn08/valheim-server-discord-bot:1.2.0
   vault:
     enabled: false  # Set to true if using Vault
   ```

   Install with custom values:
   ```bash
   helm install valheim-bot . -f custom-values.yaml -n game-servers --create-namespace
   ```

5. **Verify the deployment**

   ```bash
   kubectl get pods -n game-servers
   kubectl logs -f deployment/valheim-bot-discord-bot -n game-servers
   ```

#### Upgrading

To upgrade to a new version:
```bash
helm upgrade valheim-bot . -n game-servers
```

#### Uninstalling

To remove the deployment:
```bash
helm uninstall valheim-bot -n game-servers
```

### With Docker

#### Prerequisites
- Docker installed and running
- A running Valheim server container
- Discord bot credentials

#### Installation Steps

1. **Invite your bot to a Discord server**
   - Use the OAuth2 URL Generator from https://discord.com/developers/applications
   - Select the required bot permissions

2. **Create a `.env` file (for local development)**

   ```env
   RUNTIME_MODE=docker
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   GUILD_IDS=your_guild_id1,your_guild_id2
   CONTAINER_NAME=your_valheim_container_name
   SERVER_NAME=YourValheimServerName
   # Optional
   # DOCKER_SOCKET_PATH=/var/run/docker.sock
   # JOIN_CODE_LOOP_COUNT=20
   # JOIN_CODE_LOOP_TIMEOUT_MILLIS=5000
   ```

   **Environment Variables for Docker Mode:**
   - `RUNTIME_MODE`: Set to `docker`
   - `DISCORD_TOKEN`: Your Discord bot token
   - `DISCORD_CLIENT_ID`: Your Discord application client ID
   - `GUILD_IDS`: Comma-separated list of Discord server IDs
   - `CONTAINER_NAME`: The name or ID of your Valheim server Docker container
   - `DOCKER_SOCKET_PATH`: (Optional) Path to Docker socket (default: `/var/run/docker.sock`)
   - `SERVER_NAME`: Your Valheim server name (used to extract join code from logs)
   - `JOIN_CODE_LOOP_COUNT`: (Optional) Number of retries for join code (default: 20)
   - `JOIN_CODE_LOOP_TIMEOUT_MILLIS`: (Optional) Timeout in milliseconds (default: 5000)

3. **Run with Docker Compose**

   Update the provided `deployment/docker-compose.yaml` or create your own:
   ```yaml
   services:
     valheim-server-discord-bot:
       container_name: valheim-server-discord-bot
       image: ghcr.io/floryn08/valheim-server-discord-bot:latest
       environment:
         RUNTIME_MODE: docker
         DISCORD_TOKEN: ${DISCORD_TOKEN}
         DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
         GUILD_IDS: ${GUILD_IDS}
         CONTAINER_NAME: ${CONTAINER_NAME}
         SERVER_NAME: ${SERVER_NAME}
         JOIN_CODE_LOOP_COUNT: ${JOIN_CODE_LOOP_COUNT:-20}
         JOIN_CODE_LOOP_TIMEOUT_MILLIS: ${JOIN_CODE_LOOP_TIMEOUT_MILLIS:-5000}
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock
       restart: unless-stopped
   ```

   Run:
   ```bash
   docker compose -f deployment/docker-compose.yaml up -d
   ```

   **Important Notes:**
   - The bot needs access to the Docker socket to manage containers
   - Ensure `/var/run/docker.sock` is mounted
   - The bot container must be on the same Docker host as the Valheim server container
   - This works with Portainer-managed stacks as well

4. **Using with Portainer**

   You can deploy this stack through Portainer:
   
   1. In Portainer, go to **Stacks** → **Add stack**
   2. Name your stack (e.g., `valheim-discord-bot`)
   3. Paste the docker-compose content from `deployment/docker-compose.yaml`
   4. Set the environment variables in Portainer's environment variables section
   5. Deploy the stack
   
   The bot will manage your Valheim server container directly through the Docker API, no Portainer API configuration needed.
