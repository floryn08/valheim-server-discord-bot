require("dotenv").config();

exports.config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.GUILD_ID,
  deploymentName: process.env.DEPLOYMENT_NAME,
  namespace: process.env.NAMESPACE,
  serverName: process.env.SERVER_NAME,
  joinCodeLoopCount: process.env.JOIN_CODE_LOOP_COUNT,
  joinCodeLoopTimeoutMillis: process.env.JOIN_CODE_LOOP_TIMEOUT_MILLIS,
};
