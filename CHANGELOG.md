## [1.1.5](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.1.4...v1.1.5) (2025-05-13)


### Bug Fixes

* update discordBotImage tag format in values.yaml ([604e07e](https://github.com/floryn08/valheim-server-discord-bot/commit/604e07ec696b7d3f257d8af806f2ac8a2d553516))

## [1.1.4](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.1.3...v1.1.4) (2025-05-13)


### Bug Fixes

* add values.yaml to release assets in .releaserc ([e8df5aa](https://github.com/floryn08/valheim-server-discord-bot/commit/e8df5aadf4872e9252df031aff6c6c13a163a9af))

## [1.1.3](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.1.2...v1.1.3) (2025-05-13)


### Bug Fixes

* enhance version update script with before/after output ([728674a](https://github.com/floryn08/valheim-server-discord-bot/commit/728674aa263a4b3df10c4449ff5a8cc4f5fc8cad))

## [1.1.2](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.1.1...v1.1.2) (2025-05-13)


### Bug Fixes

* update image reference in version update script ([a1d9477](https://github.com/floryn08/valheim-server-discord-bot/commit/a1d9477b33b9d0610ec0008d539f501dffa38676))

## [1.1.1](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.1.0...v1.1.1) (2025-05-13)


### Bug Fixes

* update discordBotImage version substitution in update_versions.sh ([20d59ab](https://github.com/floryn08/valheim-server-discord-bot/commit/20d59abefbf29308d0cb988cb050ada9aa25a85b))

# [1.1.0](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.0.3...v1.1.0) (2025-05-13)


### Features

* make version update script executable in release workflow ([958a28c](https://github.com/floryn08/valheim-server-discord-bot/commit/958a28cd0b1a18c43b01e2a5ff1b27d6b044c67f))
* reintroduce version update script for semantic release ([7c06363](https://github.com/floryn08/valheim-server-discord-bot/commit/7c063634b55fc266979fbaa4784353f113b97b5a))
* **release:** add version update script for semantic release ([c1b256d](https://github.com/floryn08/valheim-server-discord-bot/commit/c1b256dc2fed36944359c70e69ceb8c425480519))
* restore version update script for semantic release ([2b3fe05](https://github.com/floryn08/valheim-server-discord-bot/commit/2b3fe057737d84036645c1c3a3e9104cff00655f))

## [1.0.3](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.0.2...v1.0.3) (2025-05-13)


### Bug Fixes

* **deps:** update all npm dependencies ([cf1dbf2](https://github.com/floryn08/valheim-server-discord-bot/commit/cf1dbf28640e6fbaee3d14c14043ccb59103504b))

## [1.0.2](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.0.1...v1.0.2) (2025-05-13)


### Bug Fixes

* **deps:** update all npm dependencies ([4daa6b3](https://github.com/floryn08/valheim-server-discord-bot/commit/4daa6b3abd1b833cc3f664a69a4a6b9875b2d448))

## [1.0.1](https://github.com/floryn08/valheim-server-discord-bot/compare/v1.0.0...v1.0.1) (2025-05-13)


### Bug Fixes

* update Helm match manager to use 'helmv3' in renovate configuration ([96536bb](https://github.com/floryn08/valheim-server-discord-bot/commit/96536bbf51ab5f48d6074977ce1c2eab0fa8ba8b))

# 1.0.0 (2025-05-13)


### Bug Fixes

* **deps:** update dependency @kubernetes/client-node to ^0.21.0 ([be9d8d7](https://github.com/floryn08/valheim-server-discord-bot/commit/be9d8d742e575291a124f98791e8508daac31130))
* **deps:** update dependency discord.js to v14.15.2 ([222b48a](https://github.com/floryn08/valheim-server-discord-bot/commit/222b48a6807d6af9265578ab3e690963c8e9a527))
* **deps:** update dependency discord.js to v14.15.3 ([667477a](https://github.com/floryn08/valheim-server-discord-bot/commit/667477a1664ae44f3c84c25a5d1512a0c44871e8))
* fixed branch name ([3aa2fdc](https://github.com/floryn08/valheim-server-discord-bot/commit/3aa2fdc6a96dbda648df59e1da44a099ca11c038))
* fixed deprecation warning ([a3490cc](https://github.com/floryn08/valheim-server-discord-bot/commit/a3490cc8b2c52545488becceca49014d3301cdc0))
* fixed tag action error ([11494c4](https://github.com/floryn08/valheim-server-discord-bot/commit/11494c4ab82d680d705ba56a457702987dd7c5a5))
* install exec ([342d067](https://github.com/floryn08/valheim-server-discord-bot/commit/342d0674a5ea73a71d50e8299a5cdd338b4bbce2))
* update release configuration by removing exec plugin and adjusting git message format ([f89a3ce](https://github.com/floryn08/valheim-server-discord-bot/commit/f89a3ce6b81fad2ffc10076d953ab038171a77c3))


### Features

* added join code extraction from logs and send it as a follow up message after container start ([#1](https://github.com/floryn08/valheim-server-discord-bot/issues/1)) ([2049589](https://github.com/floryn08/valheim-server-discord-bot/commit/2049589fd200dbcdd6a3fb550ac8c1605f20c161))
* added log parsing to send join code as reply ([#19](https://github.com/floryn08/valheim-server-discord-bot/issues/19)) ([756290d](https://github.com/floryn08/valheim-server-discord-bot/commit/756290dac3a8c0eb8f29154a614aa2e7b79292ec))
* added multi guild command refresh ([#22](https://github.com/floryn08/valheim-server-discord-bot/issues/22)) ([2d698e8](https://github.com/floryn08/valheim-server-discord-bot/commit/2d698e8ad848e9469e2ac91639bbf59998ea5c1d))
* added semantic-release ([260a8fa](https://github.com/floryn08/valheim-server-discord-bot/commit/260a8facc8ac55b9288ce0b365dc043751c9ac48))
* chart releaser ([61ab2b9](https://github.com/floryn08/valheim-server-discord-bot/commit/61ab2b9ff9b63cd20df20ee36c165dc8b984ee07))
* initial commit ([06dab0e](https://github.com/floryn08/valheim-server-discord-bot/commit/06dab0e88202f2e56a1ab33c871e7acd2ed40884))
* update for k8s deployment ([#18](https://github.com/floryn08/valheim-server-discord-bot/issues/18)) ([ea41e1f](https://github.com/floryn08/valheim-server-discord-bot/commit/ea41e1ff5c2325a18698c6a5561f2b985ee6bb2d))
* update release workflow to use cocogitto ([9abeea7](https://github.com/floryn08/valheim-server-discord-bot/commit/9abeea7077727da6baa5d19f3d42bd64058513e2))
