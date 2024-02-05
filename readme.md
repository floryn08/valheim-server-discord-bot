# Valheim Server Discord Bot
A Discord bot that uses the Portainer API to start and close the Valheim Server Docker container when needed.

This approach minimizes resource consumption since the `ghcr.io/lloesche/valheim-server` docker image doesn't support auto pausing the server when there are no players on the server.

The bot registers 3 slash commands:
- /start
- /stop
- /status

## How to run
1. Invite your bot on a server by using the OAuth2 URL Generator from here: https://discord.com/developers/applications 
2. Copy `.env.example` to `.env` and update the variables with yours
3. Run `docker compose up -d` to start the bot
4. Run `deploy-commands.js` to register commands on a discord server indicated by `GUILD_ID`