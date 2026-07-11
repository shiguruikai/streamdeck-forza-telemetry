---
type: Reference
title: "streamdeck config"
description: "Manage the local CLI configuration files."
resource: https://docs.elgato.com/streamdeck/cli/commands/config/
tags: [cli, commands, config]
timestamp: 2026-07-11T20:01:18.287986+09:00
---

# streamdeck config
Manage the local CLI configuration files.
## Synopsis

```
streamdeck config set <key>=<value> [<key>=<value>...]
streamdeck config unset <key> [<key>...]
streamdeck config list
streamdeck config reset
```

## Description
The CLI gets its configuration settings from local configuration files. These configuration settings define the output of commands and how they're executed, and enable customization of interaction. The `streamdeck config` command can be used to update and manage these settings.
## Examples
Set the `packageManager` property to `yarn`:
Terminal

```
streamdeck config set packageManager=yarn
```

Reduce motion within the CLI:
Terminal

```
streamdeck config set reduceMotion=true
```

## Sub-commands
### set

```
streamdeck config set <key>=<value> [<key>=<value>...]
```

Sets each of the configuration keys to the value provided.
### unset

```
streamdeck config <key> [<key>...]
```

Sets each of the configuration keys to their default values.
### reset

```
streamdeck config reset
```

Resets all configuration keys to their default values.
### list

```
streamdeck config list
```

Lists the defined configuration, eg. values defined using [config set](streamdeck-config.md#set).
## Configuration options
#### reduceMotion
  * Default: `false`
  * Type: Boolean

Determines whether feedback provided should prefer reduced motion; when `true`, the busy indicator will be rendered as a static indicator.
#### packageManager
  * Default: `npm`
  * Type: `bun`, `npm`, `pnpm`, `yarn`

The package manager to use when creating a new project.
