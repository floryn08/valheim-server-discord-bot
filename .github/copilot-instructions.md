# Copilot Instructions for Valheim Server Discord Bot

## Architecture Overview

This is a TypeScript Discord bot that manages game servers (Valheim, Terraria, etc.) via slash commands (`/start <server>`, `/stop <server>`, `/status <server>`). It uses the **Adapter Pattern** to support two runtime modes:

```
index.ts → commands/*.ts → utils/utils.ts → adapter.factory.ts → KubernetesAdapter | DockerAdapter
```

- **Adapter Factory** ([src/adapters/adapter.factory.ts](src/adapters/adapter.factory.ts)): Creates the appropriate adapter based on `RUNTIME_MODE` env var
- **ServerAdapter interface** ([src/adapters/server-adapter.interface.ts](src/adapters/server-adapter.interface.ts)): Contract all adapters must implement (`start`, `stop`, `status` - all take `serverId` parameter)
- **ServerConfig** ([src/types/server-config.type.ts](src/types/server-config.type.ts)): Type for server configurations parsed from `SERVERS` env var
- **Commands** are thin wrappers with autocomplete support that delegate to `utils/utils.ts`

## Key Patterns

### Adding New Commands
1. Create command file in `src/commands/` following this pattern:
```typescript
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { yourAction } from "../utils/utils";
import { servers } from "../config";

export const data = new SlashCommandBuilder()
  .setName("commandname")
  .setDescription("Description here.")
  .addStringOption((option) =>
    option
      .setName("server")
      .setDescription("The server to target")
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const choices = servers.map((s) => ({ name: s.id, value: s.id }));
  const filtered = choices.filter((choice) =>
    choice.name.toLowerCase().includes(focusedValue)
  );
  await interaction.respond(filtered.slice(0, 25));
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const serverId = interaction.options.getString("server", true);
  await yourAction(interaction, serverId);
}
```
2. Export it from `src/commands/index.ts`
3. Add corresponding function in `src/utils/utils.ts` that calls the adapter

### Adding New Servers
Add server config to the `SERVERS` environment variable JSON array:
```json
[
  {
    "id": "valheim",
    "deploymentName": "valheim-deploy",
    "containerName": "valheim",
    "serverName": "My Valheim",
    "startedLogPattern": "Session \"My Valheim\" with join code",
    "joinCodeWordIndex": 5
  },
  {
    "id": "terraria",
    "deploymentName": "terraria-deploy",
    "containerName": "terraria",
    "serverName": "My Terraria",
    "startedLogPattern": "Server started"
  }
]
```
- `startedLogPattern`: The log message pattern to detect when the server has started
- `joinCodeWordIndex`: (Optional) If the server outputs a join code, the word index to extract it from

### Adding New Runtime Modes
1. Add mode to `src/types/runtime-mode.type.ts`
2. Create adapter class implementing `ServerAdapter` in `src/adapters/`
3. Add case to factory switch in `adapter.factory.ts`
4. Add mode-specific config validation in `src/config.ts`

### Interaction Flow
Commands use Discord.js `ChatInputCommandInteraction.reply()` for initial response, then `followUp()` for subsequent messages (e.g., join code after server starts). Autocomplete interactions are handled separately via `AutocompleteInteraction`.

## Development Commands

```bash
npm run dev          # Hot-reload development with tsx
npm run build        # Production build with esbuild (bundles to dist/index.js)
npm test             # Run Jest tests
npm run test:watch   # Tests in watch mode
```

## Testing Conventions

- Tests live in `src/__tests__/*.test.ts`
- Test setup in [src/__tests__/setup.ts](src/__tests__/setup.ts) sets required env vars including `SERVERS` JSON
- Mock external dependencies (Discord.js, adapters) - see [commands.test.ts](src/__tests__/commands.test.ts) for mocking pattern
- Use `jest.mock()` at module level before imports

## Configuration

All config flows through [src/config.ts](src/config.ts):
- Uses `dotenv` for local development
- `required()` helper throws if env var missing
- `SERVERS` env var: JSON array of `ServerConfig` objects
- `servers` export: parsed array of server configs
- `getServerById(id)`: helper to find server config by ID
- Conditional validation based on `RUNTIME_MODE` (Kubernetes needs `NAMESPACE`, Docker validates `containerName` per server)

## Deployment

- Docker image built via [deployment/Dockerfile](deployment/Dockerfile) - requires `npm run build` first
- Helm chart in `deployment/helm/` for Kubernetes deployment
- Semantic-release handles versioning via commit conventions
