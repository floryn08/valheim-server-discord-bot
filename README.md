# Valheim Server Discord Bot
A Discord bot that uses the Portainer API to start and close the Valheim Server Docker container when needed.

This approach minimizes resource consumption since the valheim server docker image I use doesn't support auto pausing the server when there are no players on the server.

The bot registers 3 slash commands:
- /start
- /stop
- /status


## TODO
- [x] add multiple guilds command refresh
- [x] helm chart release
- [x] improve release workflow
- [ ] add back portainer support alongside kubernetes
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

### With docker compose (⚠️ Currently not working)
1. Invite your bot on a server by using the OAuth2 URL Generator from here: https://discord.com/developers/applications 
2. Copy `.env.example` to `.env` and update the variables with yours
3. Run `docker compose up -d` to start the bot

### With Portainer (⚠️ Currently not working)
You can deploy this bot as a container in a stack alongside the Valheim Server.

1. Copy the service from the docker-compose.yaml file into your stack
2. Add environment variables to your stack to match what is required by the container
3. Redeploy your stack 