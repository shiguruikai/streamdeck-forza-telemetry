---
type: Reference
title: "streamdeck validate"
description: "Validates the Stream Deck plugin."
resource: https://docs.elgato.com/streamdeck/cli/commands/validate/
tags: [cli, commands, validate]
timestamp: 2026-07-11T20:01:18.293930+09:00
---

# streamdeck validate
Validates the Stream Deck plugin.
## Synopsis

```
streamdeck validate [path]

Arguments:
  path                  Path of the plugin to validate

Options:
  --force-update-check  Forces an update check (default: false)
  --no-update-check     Disables updating schemas
```

## Description
Validates the Stream Deck plugin in the current working directory, or `path` when specified, and outputs the validation results. By default, the command will automatically check and install validation rule updates; this check occurs daily, unless forced with `--force-update-check` or prevented with `--no-update-check`.
## Examples
Validate the plugin in the directory `com.elgato.hello-world.sdPlugin`:
Terminal

```
streamdeck validate com.elgato.hello-world.sdPlugin
```

Validate the plugin in the current working directory, with the latest validation schemas:
Terminal

```
streamdeck validate --force-update-check
```

## Configuration
####  `--force-update-check`
  * Default: `false`
  * Type: Boolean

Forces an update check of new validation rules; by default, an update check will occur once a day. Cannot be used in conjunction with `--no-update-check`.
####  `--no-update-check`
  * Default: `false`
  * Type: Boolean

Prevents an update check of new validation rules. This configuration option is recommended when using the CLI as part of a build pipeline. Cannot be used in conjunction with `--force-update-check`.
