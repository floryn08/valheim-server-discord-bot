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
- [ ] improve release workflow
- [ ] add back portainer support alongside kubernetes
- [ ] add odin support

## How to run

### With Kubernetes
TODO

### With docker compose (⚠️ Currently not working)
1. Invite your bot on a server by using the OAuth2 URL Generator from here: https://discord.com/developers/applications 
2. Copy `.env.example` to `.env` and update the variables with yours
3. Run `docker compose up -d` to start the bot

### With Portainer (⚠️ Currently not working)
You can deploy this bot as a container in a stack alongside the Valheim Server.

1. Copy the service from the docker-compose.yaml file into your stack
2. Add environment variables to your stack to match what is required by the container
3. Redeploy your stack 