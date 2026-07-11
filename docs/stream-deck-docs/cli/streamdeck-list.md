---
type: Reference
title: "streamdeck list"
description: "Displays a list of installed plugins."
resource: https://docs.elgato.com/streamdeck/cli/commands/list/
tags: [cli, commands, list]
timestamp: 2026-07-11T20:01:18.290740+09:00
---

# streamdeck list
Displays a list of installed plugins.
## Synopsis

```
streamdeck list [options]

Options:
  -a|--all    Show all plugins (default: false)
```

## Description
Displays a list of installed plugins, and their source paths.
Available from version 1.5.0.
## Examples
### Linked Plugins
Terminal

```
streamdeck list
```

Terminal

```
streamdeck -l
```

### All Plugins
Terminal

```
streamdeck list --all
```

## Configuration
####  `-a|--all`
  * Default: `false`
  * Type: Boolean

When `true`, all installed plugins are shown.
